import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MetaAutoPost } from "../../../../features/autopost/components/meta-auto-post";
import { HydrateClient, prefetch, trpc } from "../../../../trpc/server";
import { requireAuth } from "../../../../lib/server";

const AutoPostPage = async () => {
  await requireAuth();
  prefetch(trpc.meta.getConnection.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <MetaAutoPost />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default AutoPostPage;
