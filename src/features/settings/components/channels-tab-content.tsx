"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { ChannelTypeEnum, getChannelIcon } from "../../../constants/channels";
import { cn } from "../../../lib/utils";
import { useTRPC } from "../../../trpc/client";

export function ChannelsTabContents() {
  const trpc = useTRPC();
  const { data: channelsData, isPending } = useSuspenseQuery(
    trpc.channels.list.queryOptions({ filter: "unconnected" }),
  );

  const channels = channelsData?.channels || [];

  const handleConnect = (userChannelId: string) => {
    if (!userChannelId) return;
  };
  const handleDisconnect = (userChannelId: string) => {
    if (!userChannelId) return;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channels</CardTitle>
        <CardDescription>
          Connect your social accounts to start scheduling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3 ">
                    <Skeleton className="size-8 rounded-sm bg-secondary" />
                    <Skeleton className="size-5 w-24  bg-secondary" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-secondary" />
                </div>
              ))
            : channels.map((channel) => {
                const icon = getChannelIcon(channel.type as ChannelTypeEnum);

                return (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between rounded-xl
                border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="relative">
                        {icon ? (
                          <HugeiconsIcon
                            icon={icon}
                            color="currentColor"
                            className="text-white! size-8! p-2 rounded-sm"
                            style={{
                              background: channel.color,
                            }}
                          />
                        ) : null}
                        <div
                          className={cn(
                            "absolute -right-1 bottom-0 p-0.5 bg-white dark:bg-background rounded-xs",
                            {
                              "bg-transparent p-0 rounded-full -bottom-1 -right-0.5":
                                channel.connected,
                            },
                          )}
                        >
                          {channel.connected ? (
                            <div className="size-0.5 bg-primary rounded-full " />
                          ) : (
                            <HugeiconsIcon
                              icon={PlusSignIcon}
                              className="size-2!"
                            />
                          )}
                        </div>
                      </span>
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <Button
                      variant={channel.connected ? "destructive" : "default"}
                      size={"sm"}
                      onClick={() =>
                        channel.connected
                          ? handleDisconnect(channel.userChannelId || "")
                          : handleConnect(channel.userChannelId || "")
                      }
                    >
                      {channel.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
