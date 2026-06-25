// trpc/routers/posts.ts
import prisma from "../../lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../init";

export const usersRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findMany({});
  }),
});
