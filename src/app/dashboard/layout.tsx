// import { redirect } from "next/navigation";
import DashboardLayout from "../../features/dashboard/layouts/dashboard-layout";
// import { caller } from "../../trpc/server";

const Layout = async ({
  children,
  // params,
}: {
  children: React.ReactNode;
  // params: Promise<{ orgId: string }>;
}) => {
  // const { orgId } = await params;

  // if (!orgId) {
  //   // no org ID in URL — bounce to resolver
  //   redirect("/onboarding/create-organization");
  // };

  // const membership = await caller.organizations.verifyMembership({
  //   organizationId: orgId,
  // });

  // if (!membership) {
  //   // not a member of this org (wrong URL, stale link, someone else's org) — bounce to resolver
  //   redirect("/dashboard");
  // }
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
