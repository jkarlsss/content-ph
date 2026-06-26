import { FacebookIcon, IconSvgObject, InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { ChannelType } from "../generated/prisma/enums";

export const CHANNEL_TYPE_ICONS: Record<ChannelType, IconSvgObject> = {
  [ChannelType.INSTAGRAM]: InstagramIcon,
  [ChannelType.TWITTER]: NewTwitterIcon,
  [ChannelType.FACEBOOK]: FacebookIcon,
}

export function getChannelIcon(channelType: ChannelType) {
  if (!CHANNEL_TYPE_ICONS[channelType]) {
    return null;
  }
  return CHANNEL_TYPE_ICONS[channelType];
}