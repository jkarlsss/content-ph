import { Layers, Palette, User } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { ChannelsView } from "../views/channels-view";
import { UserTabView } from "../views/user-view";
import AppearanceView from "../views/appearance-view";

export function SettingsPannel() {
  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto w-full h-full">
        <div className="py-4">
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        <div>
          <Tabs defaultValue="channels">
            <div className="mb-6 w-full border-b py-2">
              <TabsList variant={"line"} className="w-fit space-x-4">
                <TabsTrigger value="profile">
                  <User className="size-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="channels">
                  <Layers className="size-4" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="size-4" />
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>
            <UserTabView />
            <ChannelsView />
            <TabsContent value="appearance">
              <AppearanceView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
