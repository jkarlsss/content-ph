import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { AccountType } from "../../../constants/accounts";
import { useTRPC } from "../../../trpc/client";
import { MetaConnection } from "./generator";

export function PlatformCards({
  label,
  color,
  icon,
  caption,
  description,
  metaconnection,
  isLoading,
  platform
}: AccountType & { metaconnection: MetaConnection; isLoading: boolean }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const getConnectUrl = useMutation(trpc.meta.getConnectUrl.mutationOptions());

  const disconnect = useMutation(
    trpc.meta.disconnect.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.meta.getConnection.queryKey(),
        });
      },
    }),
  );

  async function handleConnect() {
    const { url } = await getConnectUrl.mutateAsync({
      redirectAfter: "/ideas?modal=open", // optional, where to go after the OAuth flow completes
    });
    window.location.href = url; // full redirect — this leaves your SPA
  }

  return (
    // 1. Added 'h-full flex flex-col' to ensure the card stretches to match its siblings
    <Card
      size="sm"
      className="w-full max-w-sm h-full flex flex-col justify-between"
    >
      {/* 2. Changed items-center to items-start so the icon stays neatly aligned if captions wrap */}
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="shrink-0 pt-0.5">
          <HugeiconsIcon icon={icon} color={color} className="size-6" />
        </div>
        <div className="space-y-1">
          <CardTitle>{label}</CardTitle>
          <CardDescription className="min-h-[20px]">{caption}</CardDescription>
        </div>
      </CardHeader>

      {/* 3. Added 'flex-1' to make the content area grow and push the footer to the very bottom */}
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>

      <CardFooter className="pt-0">
      {/* {platform === metaconnection} */}
        {isLoading && (
          <Button size="sm" className="w-full" disabled>
            <Loader className="mr-2 h-4 w-4 animate-spin" /> connecting...
          </Button>
        )}
        {!isLoading && metaconnection.connected ? (
          <Button
            size="sm"
            variant={"destructive"}
            className="w-full"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate()}
          >
            {disconnect.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                disconnecting...
              </>
            ) : (
              <>disconnect</>
            )}
          </Button>
        ) : (
          <Button size="sm" className="w-full" disabled={getConnectUrl.isPending} onClick={() => handleConnect()}>
            {getConnectUrl.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> connecting...
              </>
            ) : (
              <>connect</>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
