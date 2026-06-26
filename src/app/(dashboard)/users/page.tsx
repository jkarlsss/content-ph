import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UsersView } from "../../../features/users/views/users-view";
import { requireAuth } from "../../../lib/server";
import { prefetch, trpc } from "../../../trpc/server";

const UserPage = async () => {
  await requireAuth();

  prefetch(trpc.users.list.queryOptions());
  prefetch(trpc.userChannels.list.queryOptions());

  return (
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <UsersView />
        </Suspense>
      </ErrorBoundary>
  );
};

export default UserPage;
