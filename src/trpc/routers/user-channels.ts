// trpc/routers/organizations.ts
import { z } from "zod";
import prisma from "../../lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userChannelsRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return await prisma.userChannels.findMany();
  }),
  listByConnected: protectedProcedure
    .input(z.object({ filter: z.boolean() }))
    .query(async ({ ctx, input: { filter } }) => {
      const channels = await prisma.userChannels.findMany({
        where: {
          userId: ctx.session.user.id,
          isConnected: filter ? true : false,
        },
      });

      if (!channels) {
        return {
          channels: [],
          totalChannels: 0,
          connectedCount: 0,
        };
      }

      return {
        channels,
        totalChannels: channels.length,
        connectedCount: channels.filter((channel) => channel.isConnected)
          .length,
      };
    }),
});
