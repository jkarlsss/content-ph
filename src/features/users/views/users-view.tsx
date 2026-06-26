"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../../../trpc/client";
import { ChannelType } from "../../../generated/prisma/enums";

export function UsersView() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.users.list.queryOptions());
  const { data: channels } = useQuery(trpc.userChannels.list.queryOptions());
  return (
    <div>
      {JSON.stringify(data, null, 2)}
      {JSON.stringify(channels, null, 2)}
      {Object.values(ChannelType).map((type) => (
        <div key={type}>{type}</div>
      ))}
    </div>
  )
}
