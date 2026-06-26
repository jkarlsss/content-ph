// import { redirect } from "next/navigation";
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

  prefetch(trpc.userChannels.listByConnected.queryOptions({ filter: true }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <DashboardLayout>{children}</DashboardLayout>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Layout;
