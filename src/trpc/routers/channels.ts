// trpc/routers/organizations.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../init";
import { getOAuthProvider } from "../../lib/social-oauth";
import { ChannelTypeEnum } from "../../constants/channels";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const channelsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ filter: z.string() }))
    .query(async ({ ctx, input: { filter } }) => {
      try {
        const [typeRes, userChannelsRes] = await Promise.all([
          prisma.channelType.findMany({
            orderBy: { createdAt: "desc" },
          }),
          prisma.userChannel.findMany({
            where: { userId: ctx.session.user.id },
          }),
        ]);

        const userChannelMap = new Map(
          userChannelsRes.map((channel) => [channel.channelTypeId, channel]),
        );

        let channels = (typeRes || []).map((channelType) => {
          const userChannel = userChannelMap.get(channelType.id);

          return {
            id: channelType.id,
            type: channelType.type,
            name: channelType.name,
            color: channelType.color,
            character_limit: channelType.characterLimit,
            userChannelId: userChannel ? userChannel.id : null,
            handle: userChannel ? userChannel.handle : null,
            profile_image: userChannel ? userChannel.profileImage : null,
            profile_url: userChannel ? userChannel.profileUrl : null,
            connected: userChannel ? userChannel.isConnected : false,
          };
        });

        const totalChannels = typeRes.length || 0;
        const connectedCount = channels.filter(
          (channel) => channel.connected,
        ).length;

        if (filter === "connected") {
          channels = channels.filter((channel) => channel.connected);
        } else if (filter === "unconnected") {
          channels = channels.filter((channel) => !channel.connected);
        }
        return {
          channels,
          totalChannels,
          connectedCount,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
      }
    }),
  connect: protectedProcedure
    .input(z.object({ channelTypeId: z.string() }))
    .query(async ({ ctx, input: { channelTypeId } }) => {
      try {
        if (!channelTypeId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Channel type id not found.",
          });
        }

        if (!APP_URL) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found.",
          });
        }

        const channelType = await prisma.channelType.findFirst({
          where: { id: channelTypeId },
          select: { id: true, type: true },
        });

        if (!channelType) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Channel type not found.",
          });
        }

        const redirectTo = `${APP_URL}/settings`;

        const provider = getOAuthProvider(channelType.type as ChannelTypeEnum);


        const state = createOAuthState(
          {
            userId: ctx.session.user.id,
            channelTypeId: channelType.id,
            channelType: channelType.type,
            redirectTo
          }
        )

      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
      }
    }),
});
