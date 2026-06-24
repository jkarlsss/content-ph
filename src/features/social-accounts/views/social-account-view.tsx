// app/dashboard/[orgId]/social-accounts/social-accounts-list.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function SocialAccountsList({ organizationId }: { organizationId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router =  useRouter();

  const { data: accounts, isLoading } = useQuery(
    trpc.socialAccounts.list.queryOptions({ organizationId })
  );

  const connectMutation = useMutation(
    trpc.socialAccounts.getMetaConnectUrl.mutationOptions({
      onSuccess: (data) => {
        router.push(data.url);
      },
    })
  );

  const disconnectMutation = useMutation(
    trpc.socialAccounts.disconnect.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.socialAccounts.list.queryKey({ organizationId }),
        });
      },
    })
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading accounts...</p>;

  return (
    <div className="space-y-4">
      {accounts?.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{account.name}</CardTitle>
              <CardDescription>{account.platform}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {account.status === "NEEDS_RECONNECTION" && (
                <Badge variant="destructive">Needs reconnection</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  disconnectMutation.mutate({ organizationId, socialAccountId: account.id })
                }
                disabled={disconnectMutation.isPending}
              >
                Disconnect
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}

      <Button onClick={() => connectMutation.mutate({ organizationId })} disabled={connectMutation.isPending}>
        {connectMutation.isPending ? "Redirecting..." : "Connect Facebook / Instagram"}
      </Button>
    </div>
  );
}