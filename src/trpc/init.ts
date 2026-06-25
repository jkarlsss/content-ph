import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "../lib/auth";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session
    },
  });

});
// export const protectedProcedure = protectedProcedure
//   .input((val: unknown) => val as { organizationId: string })
//   .use(async ({ ctx, input, next }) => {
//     const membership = await prisma.organizationMember.findFirst({
//       where: {
//         userId: ctx.session.user.id,
//         organizationId: input.organizationId,
//       },
//     });
//     if (!membership) {
//       throw new TRPCError({
//         code: "FORBIDDEN",
//         message: "Not a member of this organization",
//       });
//     }
//     return next({ ctx: { ...ctx, membership } });
//   });
