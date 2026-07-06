import { HugeiconsIcon } from "@hugeicons/react";
import { ChannelTypeEnum, getChannelIcon } from "../constants/channels";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type ChannelAvatarProps = {
  type: ChannelTypeEnum;
  color: string;
  profileImage?: string | undefined;
  
  name?: string | null;
  size?: "sm" | "md";
  className: string;
};

export function ChannelAvatar({
  type,
  color,
  profileImage,
  name,
  size,
  className,
}: ChannelAvatarProps) {
  const icon = getChannelIcon(type);

  return (
    <div className={cn(className)}>
      <Avatar className={cn(size === "sm" ? "size-8" : "size-10", "border")}>
        <AvatarFallback>LM</AvatarFallback>
        <AvatarImage
          src={profileImage || "/profile.svg"}
          alt={name || "Channel"}
          className="rounded-xl!"
        >
          {icon ? (
            <div
              className={cn(
                "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center",
                "right-[3px] bottom-[-3px] rounded-sm bg-white p-[1px] ring-0",
                size === "sm" ? "size-[15px]" : "size-[20px]",
              )}
            >
              <span
                className="flex size-full items-center justify-center rounded-sm p-[4px]!"
                style={{ background: color }}
              >
                <HugeiconsIcon
                  icon={icon}
                  className={cn("text-white! size-2.5!")}
                />
              </span>
            </div>
          ) : null}
        </AvatarImage>
      </Avatar>
      {name ? (
        <span className="truncate font-medium text-[14.0px]">{name}</span>
      ) : null}
    </div>
  );
}
