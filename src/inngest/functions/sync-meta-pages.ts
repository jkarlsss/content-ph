// server/inngest/functions/sync-meta-pages.ts
import { inngest, metaConnectionCreated, metaConnectionSyncRequested } from "../client";
import { fetchManagedPages, fetchInstagramAccountForPage } from "@/lib/meta-oauth";
import { NonRetriableError } from "inngest";
import prisma from "../../lib/prisma";
import { decrypt, encrypt } from "../../lib/encryption";

export const syncMetaPages = inngest.createFunction(
  {
    id: "sync-meta-pages",
    retries: 3,
    triggers: [{ event: metaConnectionCreated }, { event: metaConnectionSyncRequested }],
    // If this connection's sync keeps failing, mark it instead of retrying forever.
    onFailure: async ({ event }) => {
      const connectionId = event.data.event.data.connectionId;
      await prisma.metaConnection.update({
        where: { id: connectionId },
        data: { status: "NEEDS_REAUTH", lastError: "Failed to sync pages after retries" },
      });
    },
  },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    const connection = await step.run("load-connection", async () => {
      const c = await prisma.metaConnection.findUnique({ where: { id: connectionId } });
      if (!c) throw new NonRetriableError(`Connection ${connectionId} not found`);
      return c;
    });

    const pages = await step.run("fetch-pages", async () => {
      const token = decrypt(connection.accessTokenEnc);
      return fetchManagedPages(token);
    });

    // Resolve each page's IG business account in parallel, each as its own
    // retryable step so a single flaky page doesn't blow up the whole sync.
    const pagesWithIg = await Promise.all(
      pages.map((page) =>
        step.run(`resolve-ig-${page.id}`, async () => {
          const igId = await fetchInstagramAccountForPage(page.id, page.access_token);
          return { ...page, igId };
        })
      )
    );

    await step.run("persist-pages", async () => {
      await prisma.$transaction(
        pagesWithIg.map((page) =>
          prisma.metaPage.upsert({
            where: { connectionId_pageId: { connectionId, pageId: page.id } },
            create: {
              connectionId,
              pageId: page.id,
              pageName: page.name,
              pageAccessTokenEnc: encrypt(page.access_token),
              instagramBusinessAccountId: page.igId,
            },
            update: {
              pageName: page.name,
              pageAccessTokenEnc: encrypt(page.access_token),
              instagramBusinessAccountId: page.igId,
            },
          })
        )
      );
    });

    await step.run("mark-synced", () =>
      prisma.metaConnection.update({
        where: { id: connectionId },
        data: { lastSyncedAt: new Date(), lastError: null },
      })
    );

    return { pagesSynced: pagesWithIg.length };
  }
);