import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "../../../trpc/server";
import { Suspense } from "react";
import { UsersView } from "../../../features/users/views/users-view";

const UserPage = () => {
  prefetch(trpc.users.list.queryOptions({organizationId: ''}));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <UsersView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default UserPage