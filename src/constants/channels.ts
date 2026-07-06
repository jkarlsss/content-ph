import { FacebookIcon, IconSvgObject, InstagramIcon, LinkedinIcon, NewTwitterIcon, TiktokIcon } from "@hugeicons/core-free-icons";

export enum ChannelTypeEnum {
  TWITTER = "TWITTER",
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
  LINKEDIN = "LINKEDIN",
  TIKTOK = "TIKTOK",
}

export const CHANNEL_TYPE_ICONS: Record<ChannelTypeEnum, IconSvgObject> = {
  [ChannelTypeEnum.TWITTER]: NewTwitterIcon,
  [ChannelTypeEnum.FACEBOOK]: FacebookIcon,
  [ChannelTypeEnum.INSTAGRAM]: InstagramIcon,
  [ChannelTypeEnum.LINKEDIN]: LinkedinIcon,
  [ChannelTypeEnum.TIKTOK]: TiktokIcon
};

export const CHANNEL_TYPE_URLS: Record<ChannelTypeEnum, string> = {
  [ChannelTypeEnum.TWITTER]: "https://twitter.com/",
  [ChannelTypeEnum.FACEBOOK]: "https://www.facebook.com/",
  [ChannelTypeEnum.INSTAGRAM]: "https://www.instagram.com/",
  [ChannelTypeEnum.LINKEDIN]: "https://www.linkedin.com/",
  [ChannelTypeEnum.TIKTOK]: "https://www.tiktok.com/",
};

export function getChannelUrl(type: ChannelTypeEnum): string {
  return CHANNEL_TYPE_URLS[type] || "";
}

export function getChannelIcon(type: ChannelTypeEnum): IconSvgObject {
  return CHANNEL_TYPE_ICONS[type] || NewTwitterIcon;
}