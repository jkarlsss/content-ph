import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import IdeasView from "../../../features/ideas/views/ideas-views";
import { requireAuth } from "../../../lib/server";
import { HydrateClient, prefetch, trpc } from "../../../trpc/server";

const IdeasPage = async () => {
  await requireAuth();

  prefetch(trpc.meta.getConnection.queryOptions());
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <IdeasView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default IdeasPage;
