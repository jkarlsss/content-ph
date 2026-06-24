"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "../../../trpc/client";

export function UsersView() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.users.list.queryOptions({organizationId: ''}));
  return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}
