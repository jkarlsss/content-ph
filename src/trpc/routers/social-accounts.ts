// trpc/routers/social-accounts.ts
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import {
  buildMetaOAuthUrl,
  exchangeForLongLivedToken,
  fetchManagedPages,
  fetchInstagramAccountForPage,
} from "@/lib/meta-oauth";
import { addDays } from "date-fns";
import { encrypt } from "../../lib/encryption";
import prisma from "../../lib/prisma";

export const socialAccountsRouter = createTRPCRouter({
  list: orgProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.socialAccount.findMany({
        where: { organizationId: input.organizationId },
        select: {
          id: true,
          platform: true,
          name: true,
          status: true,
          tokenExpiresAt: true,
        }, // never select accessToken — keep it server-only
      });
    }),

  getMetaConnectUrl: orgProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ input }) => {
      const state = Buffer.from(JSON.stringify({ organizationId: input.organizationId })).toString("base64");
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`;
      return { url: buildMetaOAuthUrl(redirectUri, state) };
    }),

  // Called after OAuth callback resolves pages — lets user pick which to connect
  listAvailablePages: orgProcedure
    .input(z.object({ organizationId: z.string(), shortLivedToken: z.string() }))
    .mutation(async ({ input }) => {
      const longLived = await exchangeForLongLivedToken(input.shortLivedToken);
      const pages = await fetchManagedPages(longLived.access_token);

      const withIg = await Promise.all(
        pages.map(async (page) => ({
          ...page,
          instagramAccountId: await fetchInstagramAccountForPage(page.id, page.access_token),
        }))
      );

      return { pages: withIg, longLivedUserToken: longLived.access_token };
    }),

  connectPages: orgProcedure
    .input(
      z.object({
        organizationId: z.string(),
        selections: z.array(
          z.object({
            pageId: z.string(),
            pageName: z.string(),
            pageToken: z.string(),
            instagramAccountId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await prisma.$transaction(
        input.selections.flatMap((sel) => {
          const ops = [
            prisma.socialAccount.create({
              data: {
                status: "CONNECTED",
                organizationId: input.organizationId,
                platform: "FACEBOOK",
                externalId: sel.pageId,
                name: sel.pageName,
                accessToken: encrypt(sel.pageToken),
                tokenExpiresAt: addDays(new Date(), 60),
              },
            }),
          ];
          if (sel.instagramAccountId) {
            ops.push(
              prisma.socialAccount.create({
                data: {
                  organizationId: input.organizationId,
                  platform: "INSTAGRAM",
                  status: "CONNECTED",
                  externalId: sel.instagramAccountId,
                  name: `${sel.pageName} (Instagram)`,
                  accessToken: encrypt(sel.pageToken), // IG uses the same page token
                  tokenExpiresAt: addDays(new Date(), 60),
                },
              })
            );
          }
          return ops;
        })
      );
      return { connected: created.length };
    }),

  disconnect: orgProcedure
    .input(z.object({ organizationId: z.string(), socialAccountId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const account = await prisma.socialAccount.findFirst({
        where: { id: input.socialAccountId, organizationId: input.organizationId },
      });
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.socialAccount.delete({ where: { id: input.socialAccountId } });
      return { success: true };
    }),
});