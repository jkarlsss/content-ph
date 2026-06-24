// trpc/routers/posts.ts
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import { createPostSchema } from "../../lib/schemas/post";
import prisma from "../../lib/prisma";

export const postsRouter = createTRPCRouter({
  list: orgProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.post.findMany({
        where: { organizationId: input.organizationId },
        include: { targets: { include: { socialAccount: true } } },
        orderBy: { scheduledAt: "desc" },
      });
    }),

  create: orgProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      // verify all social accounts belong to this org — prevents cross-tenant targeting
      const accounts = await prisma.socialAccount.findMany({
        where: { id: { in: input.socialAccountIds }, organizationId: input.organizationId },
      });
      if (accounts.length !== input.socialAccountIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid social account selection" });
      }

      const post = await prisma.post.create({
        data: {
          organizationId: input.organizationId,
          authorId: ctx.session.user.id,
          content: input.content,
          mediaUrls: input.mediaUrls,
          scheduledAt: input.scheduledAt,
          status: "SCHEDULED",
          targets: {
            create: accounts.map((acc) => ({ socialAccountId: acc.id, status: "SCHEDULED" })),
          },
        },
        include: { targets: true },
      });

      await inngest.send({
        name: "post/scheduled",
        data: { postId: post.id, scheduledAt: input.scheduledAt.toISOString() },
      });

      return post;
    }),

  retry: orgProcedure
    .input(z.object({ organizationId: z.string(), postTargetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await prisma.postTarget.findFirst({
        where: { id: input.postTargetId, post: { organizationId: input.organizationId } },
        include: { post: true },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.postTarget.update({
        where: { id: target.id },
        data: { status: "SCHEDULED", errorMessage: null },
      });

      await inngest.send({
        name: "post/scheduled",
        data: { postId: target.postId, scheduledAt: new Date().toISOString() },
      });

      return { success: true };
    }),
});