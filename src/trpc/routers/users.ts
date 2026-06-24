// trpc/routers/posts.ts
import prisma from "../../lib/prisma";
import { createTRPCRouter, orgProcedure } from "../init";

export const usersRouter = createTRPCRouter({
  list: orgProcedure.query(async ({ ctx }) => {
    return prisma.user.findMany({});
  }),
});
