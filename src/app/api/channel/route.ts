import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "";

    const [typeRes, userChannelsRes] = await Promise.all([
      prisma.channelType.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.userChannel.findMany({
        where: { userId: session.user.id },
      }),
    ]);

    const userChannelMap = new Map(userChannelsRes.map(channel => [channel.channelTypeId, channel]));

    let channels = (typeRes || []).map(channelType => {
      const userChannel = userChannelMap.get(channelType.id);

      return {
        id: channelType.id,
        type : channelType.type,
        name  : channelType.name,
        color: channelType.color,
        character_limit: channelType.characterLimit,
        userChannelId: userChannel ? userChannel.id : null,
        handle: userChannel ? userChannel.handle : null,
        profile_image: userChannel ? userChannel.profileImage : null,
        profile_url: userChannel ? userChannel.profileUrl : null,
        connected: userChannel ? userChannel.isConnected : false,
      }
    });

    const totalChannels = typeRes.length || 0;
    const connectedCount = channels.filter(channel => channel.connected).length;

    if (filter === "connected") {
      channels = channels.filter(channel => channel.connected);
    } else if (filter === "unconnected") {
      channels = channels.filter(channel => !channel.connected);
    }

    NextResponse.json({
      channels,
      totalChannels,
      connectedCount,
    });

  } catch (error) {
    console.error("Error fetching channels: "+error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
