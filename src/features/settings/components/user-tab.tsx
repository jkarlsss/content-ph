"use client";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { TabsContent } from "../../../components/ui/tabs";
import { useSession } from "../../../lib/auth-client";

export function UserTab() {
  const { data: session } = useSession();

  return (
    <TabsContent value="profile">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Make changes to your profile here. You can change your name, photo,
            and bio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {session?.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name!}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center
              rounded-full bg-muted"
              >
                <UserIcon className="size-8 text-muted-foreground" />
              </div>
            )}

            <div>
              <p className="font-medium">{session?.user.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
