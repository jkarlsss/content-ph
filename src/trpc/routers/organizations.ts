// trpc/routers/organizations.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "../../lib/prisma";

export const organizationsRouter = createTRPCRouter({
  resolveActive: protectedProcedure.query(async ({ ctx }) => {
    // Since it's 1:1 today, this is really just "find their one membership"
    try {
      const membership = await prisma.organizationMember.findFirst({
        where: { userId: ctx.session.user.id },
        select: { organizationId: true },
      });

      if (!membership) {
        return { organizationId: null };
      }

      if (membership) {
        // keep lastActiveOrganizationId in sync even though there's only one today —
        // this is the field that does real work once multi-org ships
        await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { lastActiveOrganizationId: membership.organizationId },
        });
      }

      return { organizationId: membership?.organizationId ?? null };
    } catch (error) {
      return { organizationId: null };
    }
  }),
  verifyMembership: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          organizationId: input.organizationId,
        },
        include: { organization: { select: { name: true } } },
      });
      if (!membership) return null;
      return {
        role: membership.role,
        organizationName: membership.organization.name,
      };
    }),
  // trpc/routers/organizations.ts — add this mutation
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // enforce one-org-per-user at the app level, even though schema allows more later
      try {
        const existing = await prisma.organizationMember.findFirst({
          where: { userId: ctx.session.user.id },
        });
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You already belong to an organization.",
          });
        }
      } catch (error) {}
        console.log(input.name);

      const org = await prisma.$transaction(async () => {

        const newOrg = await prisma.organization.create({
          data: { name: input.name },
        });

        await prisma.organizationMember.create({
          data: {
            userId: ctx.session.user.id,
            organizationId: newOrg.id,
            role: "OWNER",
          },
        });
        await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { lastActiveOrganizationId: newOrg.id },
        });
        return newOrg;
      });

      return org;
    }),
});
