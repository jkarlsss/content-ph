import { FacebookIcon, IconSvgObject, InstagramIcon, LinkedinIcon, NewTwitterIcon, TiktokIcon } from "@hugeicons/core-free-icons";
import { Platform } from "../generated/prisma/enums";

export type AccountType = {
  label: string;
  color: string;
  icon: IconSvgObject;
  caption: string;
  description: string;
}
export const ACCOUNT_TYPES: Record<Platform, AccountType> = {
  [Platform.INSTAGRAM]: {
    label: "Instagram",
    color: "var(--platform-instagram)",
    icon: InstagramIcon,
    caption: "Link your Instagram Professional account.",
    description: "Publish posts, reels, and stories automatically while monitoring engagement metrics and follower analytics.",
  },
  [Platform.TWITTER]: {
    label: "Twitter",
    color: "var(--platform-twitter)",
    icon: NewTwitterIcon,
    caption: "Connect your X account for real-time updates.",
    description: "Schedule threads, track brand mentions, and analyze your tweet impressions and engagement seamlessly.",
  },
  [Platform.FACEBOOK]: {
    label: "Facebook",
    color: "var(--platform-facebook)",
    icon: FacebookIcon,
    caption: "Connect your Facebook Page to sync content.",
    description: "Schedule posts, respond to comments, and track your audience growth directly from your central dashboard.",
  },
  [Platform.LINKEDIN]: {
    label: "LinkedIn",
    color: "var(--platform-linkedin)",
    icon: LinkedinIcon,
    caption: "Connect your LinkedIn Company Page.",
    description: "Share industry insights, automate professional updates, and track B2B networking engagement analytics.",
  },
  [Platform.TIKTOK]: {
    label: "TikTok",
    color: "var(--platform-tiktok)",
    icon: TiktokIcon,
    caption: "Sync your TikTok Creator or Business profile.",
    description: "Upload short-form videos, plan your content calendar, and view video performance and trend insights.",
  },
};