// Mirrors the enums and shapes in schema.prisma so this view maps 1:1
// onto SchedulePosts joined with UserChannels once wired to real data.

export type Platform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "LINKEDIN"
  | "TIKTOK";

export type PostStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "PARTIALLY_PUBLISHED";

export interface ChannelSummary {
  id: string;
  channelType: Platform;
  handle: string;
  profileImage: string;
}

// Flattened view of SchedulePosts + its UserChannel relation —
// the shape this page actually consumes.
export interface PostCardData {
  id: string;
  content: string;
  images: string[];
  status: PostStatus;
  scheduleAt: string; // ISO
  timezone: string;
  publishAt: string | null;
  publishUrl: string | null;
  channel: ChannelSummary;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TWITTER: "X",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
};

export const PLATFORM_COLOR: Record<Platform, string> = {
  INSTAGRAM: "var(--platform-instagram)",
  FACEBOOK: "var(--platform-facebook)",
  TWITTER: "var(--platform-twitter)",
  LINKEDIN: "var(--platform-linkedin)",
  TIKTOK: "var(--platform-tiktok)",
};
