"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "../../../trpc/client";
import { ConnectionDialog } from "./dialogs/connection-dialog";
import Generator from "./generator";
/* ----------------------------------------------------------------------- */
/*  Component                                                               */
/* ----------------------------------------------------------------------- */

export default function PostGenerator() {
  const trpc = useTRPC();

  // Meta connection — used to populate the per-card page selector.
  // Suspense query: this component will suspend until the connection
  // status resolves, consistent with how MetaAutoPost reads it.
  const { data: metaConnection, isLoading } = useSuspenseQuery(
    trpc.meta.getConnection.queryOptions(),
  );

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col gap-5">
        <header className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Post generator
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Set the brief once, connect your accounts, and get on-brand drafts
              for every platform. Securely link your Facebook, Instagram, and
              more to edit inline, save what’s pending, and publish what’s ready
              instantly.
            </p>
          </div>
          <ConnectionDialog metaConnection={metaConnection} isLoading={isLoading} />
        </header>
        <Generator metaConnection={metaConnection} />
      </div>
    </div>
  );
}
