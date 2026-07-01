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

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
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
  postToPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string().min(1), // the Facebook page numeric ID you already store
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Make sure the page actually belongs to the current user
      const page = await prisma.metaPage.findFirst({
        where: {
          pageId: input.pageId,
          connection: {
            userId: ctx.session.user.id,
            status: { in: ["ACTIVE", "NEEDS_REAUTH"] }, // only allow active-ish tokens
          },
        },
        select: {
          id: true,
          accessTokenEnc: true,
          pageId: true,
        },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found or you don’t have access to it",
        });
      }

      // 2. Decrypt the page access token
      const accessToken = decrypt(page.accessTokenEnc);

      // 3. Post to Facebook Graph API v25.0
      const res = await fetch(
        `https://graph.facebook.com/v25.0/${page.pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            message: input.message,
            access_token: accessToken,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: data.error?.message ?? "Facebook API error",
        });
      }

      return { postId: data.id };
    }),

  postPhotoToPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string().min(1),
        message: z.string().optional(),
        imageBase64: z.string(), // data:image/...;base64,...
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const page = await prisma.metaPage.findFirst({
        where: {
          pageId: input.pageId,
          connection: {
            userId: ctx.session.user.id,
            status: { in: ["ACTIVE", "NEEDS_REAUTH"] },
          },
        },
        select: { accessTokenEnc: true, pageId: true },
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found or you don't have access to it",
        });
      }

      const accessToken = decrypt(page.accessTokenEnc);

      const base64Data = input.imageBase64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );
      const buffer = Buffer.from(base64Data, "base64");

      const form = new FormData();
      form.append("source", new Blob([buffer]), "image.jpg");
      if (input.message) form.append("caption", input.message);
      form.append("access_token", accessToken);

      const res = await fetch(
        `https://graph.facebook.com/v25.0/${page.pageId}/photos`,
        { method: "POST", body: form },
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: data.error?.message ?? "Facebook API error",
        });
      }

      return { postId: data.post_id ?? data.id };
    }),
});
