import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "../../../trpc/server";
import { MetaConnectCard } from "../../../features/settings/views/meta-view";

export default function Settings() {
  prefetch(trpc.meta.getConnection.queryOptions());
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <MetaConnectCard />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
