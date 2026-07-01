import { ErrorBoundary } from "react-error-boundary";
import { MetaAutoPost } from "../../../../features/autopost/components/meta-auto-post";
import { MetaConnectCard } from "../../../../features/settings/views/meta-view";
import { requireAuth } from "../../../../lib/server";
import { HydrateClient, prefetch, trpc } from "../../../../trpc/server";
import { Suspense } from "react";

export default async function IntegrationsPage() {
  await requireAuth();

  prefetch(trpc.meta.getConnection.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="max-w-2xl mx-auto py-10 space-y-8">
            <h1 className="text-2xl font-bold">Integrations</h1>

            {/* The card you already built – connects/displays Meta status */}
            <MetaConnectCard />

            {/* Only show the post form if the user is connected */}
            <MetaAutoPost />
          </div>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
