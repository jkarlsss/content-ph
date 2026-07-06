// import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import DashboardLayout from "../../features/dashboard/layouts/dashboard-layout";
import { requireAuth } from "../../lib/server";
import { HydrateClient, prefetch, trpc } from "../../trpc/server";
// import { caller } from "../../trpc/server";

const Layout = async ({
  children,
  // params,
}: {
  children: React.ReactNode;
  // params: Promise<{ orgId: string }>;
}) => {
  await requireAuth();

  prefetch(trpc.channels.list.queryOptions({ filter: "unconnected" }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardLayout>{children}</DashboardLayout>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Layout;
