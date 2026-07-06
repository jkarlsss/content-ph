"use client";

import * as React from "react";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  AudioLinesIcon,
  BookOpenIcon,
  BotIcon,
  CreditCard,
  FolderIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  MoreHorizontalIcon,
  PieChartIcon,
  PlusCircleIcon,
  Settings2Icon,
  SettingsIcon,
  TerminalIcon,
  TerminalSquareIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChannelTypeEnum,
  getChannelIcon,
  getChannelUrl,
} from "../constants/channels";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import { useTRPC } from "../trpc/client";
import { ChannelAvatar } from "./channel-avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
        },
        {
          title: "Generate Posts",
          url: "/dashboard/posts",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Ideas",
      url: "/ideas",
      icon: <FrameIcon />,
    },
    {
      name: "Posts",
      url: "/posts",
      icon: <BookOpenIcon />,
    },
    {
      name: "Accounts",
      url: "/accounts",
      icon: <FolderIcon />,
    },
    {
      name: "Schedule",
      url: "/schedule",
      icon: <PieChartIcon />,
    },
    {
      name: "Billing",
      url: "/billing",
      icon: <CreditCard />,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: <SettingsIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const { data: channelsData, isPending } = useSuspenseQuery(
    trpc.channels.list.queryOptions({ filter: "unconnected" }),
  );

  const channels = channelsData?.channels || [];

  const unconnectedChannels = channels.filter((channel) => !channel.connected);
  const connectedChannels = channels.filter((channel) => channel.connected);

  const connectedCount = channelsData?.connectedCount || 0;
  const totalChannels = channelsData?.totalChannels || 0;
  const limitedChannels = unconnectedChannels.slice(0, 4);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.name}
                  >
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Connected channels */}
        {connectedChannels.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Channels</SidebarGroupLabel>
            {isPending ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : (
              <SidebarMenu>
                {connectedChannels.map((channel) => {
                  const url = getChannelUrl(channel.type as ChannelTypeEnum);
                  return (
                    <SidebarMenuItem key={channel.type}>
                      <SidebarMenuButton asChild>
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          href={`${url}/${channel.handle}`}
                          className="w-full! relative block items-center gap-2"
                        >
                          <ChannelAvatar
                            size="sm"
                            className=""
                            type={channel.type as ChannelTypeEnum}
                            color={channel.color}
                            profileImage={channel.profile_image || undefined}
                            name={channel.name}
                          />
                          {channel.type}
                        </Link>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            className="aria-expanded:bg-muted"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-fit"
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                        >
                          <DropdownMenuItem>
                            <FolderIcon />
                            <span>View Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowRightIcon />
                            <span>Share Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2Icon />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroup>
        )}

        {/* Unconnected channels */}

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Connect Channels</SidebarGroupLabel>
          {isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full bg-secondary" />
              <Skeleton className="h-8 w-full bg-secondary" />
              <Skeleton className="h-8 w-full bg-secondary" />
            </div>
          ) : (
            <SidebarMenu>
              {limitedChannels.map((channel) => {
                const icons = getChannelIcon(channel.type as ChannelTypeEnum);

                return (
                  <div key={channel.id}>
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={`Connect ${channel.name}`}
                      >
                        <button
                          className="flex items-center gap-2"
                        >
                          <span>
                            <div className="relative">
                              {icons ? (
                                <HugeiconsIcon
                                  icon={icons}
                                  color="currentColor"
                                  className="text-white! size-8! p-2 rounded-sm"
                                  style={{
                                    background: channel.color,
                                  }}
                                />
                              ) : null}
                              <div
                                className={cn(
                                  "absolute -right-1 bottom-0 p-0.5 bg-white dark:bg-background rounded-xs",
                                )}
                              >
                                <HugeiconsIcon
                                  icon={PlusSignIcon}
                                  className="size-2!"
                                />
                              </div>
                            </div>
                          </span>
                          <span
                            className="
                        truncate
                        "
                          >
                            {channel.name}
                          </span>
                        </button>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            className="aria-expanded:bg-muted"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-fit"
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                        >
                          <DropdownMenuItem>
                            <FolderIcon />
                            <span>View Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowRightIcon />
                            <span>Share Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2Icon />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  </div>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant={"ghost"}
                    asChild
                    className="w-full justify-start mt-2"
                  >
                    <Link
                      href={"/settings"}
                      className="w-full flex items-center gap-2"
                    >
                      <PlusCircleIcon className="size-4!" />
                      <span className="truncate">More Channels</span>
                    </Link>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="mb-3 text-xs text-muted-foreground">
          <span className="">
            {connectedCount}/{totalChannels} channels connected
          </span>
        </div>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
