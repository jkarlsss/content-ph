import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SettingsView } from "../../../features/settings/views/settings-view";
import { HydrateClient, prefetch, trpc } from "../../../trpc/server";

export default function SettingsPage() {
  prefetch(trpc.channels.list.queryOptions({ filter: "unconnected" }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
