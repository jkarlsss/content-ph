"use client";

import { TabsContent } from "../../../components/ui/tabs";
import { ChannelsTabContents } from "./channels-tab-content";

export function ChannelsTab() {
  return (
    <TabsContent value="channels">
      <ChannelsTabContents />
    </TabsContent>
  )
}
