import { redirect } from "next/navigation";
import Dashboard from "../../features/dashboard/views/dashboard";
import { caller } from "../../trpc/server";
export default async function Page() {
  // const result = await caller.organizations.resolveActive();

  // if (!result.organizationId) {
  //   redirect("/onboarding/create-organization");
  // }
  return <Dashboard organizationId={"asda"} />;
}
