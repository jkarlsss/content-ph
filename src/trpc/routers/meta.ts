// server/routers/meta.ts
import { buildMetaOAuthUrl } from "@/lib/meta-oauth";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { decrypt } from "../../lib/encryption";
import prisma from "../../lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../init";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const metaRouter = createTRPCRouter({
  /**
   * Step 1 of the connect flow. Generates + persists a CSRF `state`, returns
   * the URL to redirect the browser to. Call this from a client mutation,
   * then `window.location.href = data.url`.
   */
  getConnectUrl: protectedProcedure
    .input(z.object({ redirectAfter: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const state = randomBytes(32).toString("hex");

      await prisma.metaOAuthState.create({
        data: {
          state,
          userId: ctx.session.user.id,
          redirectAfter: input.redirectAfter,
          expiresAt: new Date(Date.now() + STATE_TTL_MS),
        },
      });

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`;
      const url = buildMetaOAuthUrl(redirectUri, state);

      return { url };
    }),

  /** Status for the "connect your Meta account" UI. */
  getConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connection = await prisma.metaConnection.findUniqueOrThrow({
        where: { userId: ctx.session.user.id },
        include: { pages: true },
      });

      if (!connection) return { connected: false as const };

      return {
        connected: true as const,
        status: connection.status,
        tokenExpiresAt: connection.tokenExpiresAt,
        lastSyncedAt: connection.lastSyncedAt,
        lastError: connection.lastError,
        pages: connection.pages.map((p) => ({
          id: p.id,
          pageId: p.pageId,
          pageName: p.pageName,
          instagramBusinessAccountId: p.instagramBusinessAccountId,
        })),
      };
    } catch {
      return { connected: false as const };
    }
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const connection = await prisma.metaConnection.findUnique({
      where: { userId: ctx.session.user.id },
    });
    if (!connection) throw new TRPCError({ code: "NOT_FOUND" });

    // Best-effort revoke on Meta's side too — ignore failure, we still
    // delete locally either way.
    try {
      const token = decrypt(connection.accessTokenEnc);
      await fetch(
        `https://graph.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}/me/permissions?access_token=${encodeURIComponent(token)}`,
        { method: "DELETE" },
      );
    } catch {
      // token may already be invalid — fine, we're deleting the row anyway
    }

    await prisma.metaConnection.delete({ where: { id: connection.id } });
    return { ok: true };
  }),
});
