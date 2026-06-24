// app/onboarding/create-organization/page.tsx
import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import OnboardingCreateView from "../../../features/onboarding/views/onboarding-create-view";

export default async function CreateOrganizationPage() {
  // guard: if they already have an org, this page has nothing to do
  const result = await caller.organizations.resolveActive();
  if (result.organizationId) {
    redirect(`/dashboard/${result.organizationId}`);
  }

  return (
    <OnboardingCreateView />
  );
}