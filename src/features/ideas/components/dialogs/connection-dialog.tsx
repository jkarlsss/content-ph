import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ACCOUNT_TYPES } from "../../../../constants/accounts";
import { Platform } from "../../../../generated/prisma/enums";
import { MetaConnection } from "../generator";
import { PlatformCards } from "../platform-cards";

export function ConnectionDialog({
  metaConnection,
  isLoading,
}: {
  metaConnection: MetaConnection;
  isLoading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("modal") === "open";

  function handleOpenChange(open: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (open) {
      params.set("modal", "open");
    } else {
      params.delete("modal");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button>Connect accounts</Button>
        </DialogTrigger>
        <DialogContent className="sm:min-w-sm xl:min-w-4xl">
          <DialogHeader>
            <DialogTitle>Connect your accounts</DialogTitle>
            <DialogDescription>
              Connect your social media accounts to enable seamless posting and
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
              {Object.values(Platform).map((platform) => {
                const accountType = ACCOUNT_TYPES[platform];
                
                return (
                  <PlatformCards
                    metaconnection={metaConnection}
                    isLoading={isLoading}
                    key={platform}
                    label={accountType.label}
                    color={accountType.color}
                    icon={accountType.icon}
                    caption={accountType.caption}
                    description={accountType.description}
                    platform={accountType.platform}
                  />
                );
              })}
            </div>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
