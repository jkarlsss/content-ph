// app/settings/integrations/meta-connect-card.tsx
"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "../../../trpc/client";
import { signIn } from "../../../lib/auth-client";

export function MetaConnectCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // useTRPC() just builds typed options — you still pass them to TanStack's
  // own useQuery/useMutation to actually get live state (data, isPending, etc).
  const { data, isLoading } = useSuspenseQuery(trpc.meta.getConnection.queryOptions());

  const getConnectUrl = useMutation(trpc.meta.getConnectUrl.mutationOptions());

  const disconnect = useMutation(
    trpc.meta.disconnect.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.meta.getConnection.queryKey() });
      },
    })
  );

  async function handleConnect() {
    const { url } = await getConnectUrl.mutateAsync({
      redirectAfter: "/ideas?dialog=open", // optional, where to go after the OAuth flow completes
    });
    window.location.href = url; // full redirect — this leaves your SPA
  }

  const handleSignIn = async () => {
    const data = signIn.social({
        provider: "facebook"
    });
    console.log(data);
  }

  if (isLoading) return null;

  return (
    <Card>
      <Button onClick={handleSignIn}>
        facebook
      </Button>
      <CardHeader>
        <CardTitle>Meta (Facebook & Instagram)</CardTitle>
        <CardDescription>
          Connect your Facebook Page to manage Instagram messages and insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data?.connected ? (
          <Button onClick={handleConnect} disabled={getConnectUrl.isPending}>
            {getConnectUrl.isPending ? "Redirecting…" : "Connect Meta account"}
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={data.status === "ACTIVE" ? "success" : "danger"}>
                {data.status}
              </Badge>
              {data.status === "NEEDS_REAUTH" && (
                <span className="text-sm text-muted-foreground">
                  Reconnect to keep this integration working.
                </span>
              )}
            </div>

            <ul className="text-sm space-y-1">
              {data.pages.map((p) => (
                <li key={p.id}>
                  {p.pageName}
                  {p.instagramBusinessAccountId ? " (Instagram linked)" : " (no Instagram linked)"}
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              {data.status === "NEEDS_REAUTH" && (
                <Button onClick={handleConnect}>Reconnect</Button>
              )}
              <Button
                variant="outline"
                onClick={() => disconnect.mutate()}
                disabled={disconnect.isPending}
              >
                Disconnect
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
