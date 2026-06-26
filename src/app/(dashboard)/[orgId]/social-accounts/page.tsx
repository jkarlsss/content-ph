// app/dashboard/[orgId]/social-accounts/page.tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SocialAccountsList } from "../../../../features/social-accounts/views/social-account-view";

export default async function SocialAccountsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  prefetch(trpc.socialAccounts.list.queryOptions({ organizationId: orgId }));

  return (
    <HydrateClient>
      <h1 className="text-2xl font-semibold mb-4">Connected Accounts</h1>
      <SocialAccountsList organizationId={orgId} />
    </HydrateClient>
  );
}