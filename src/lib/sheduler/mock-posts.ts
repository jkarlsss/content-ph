import type { PostCardData } from "./types";

const now = Date.now();
const hours = (n: number) => now + n * 60 * 60 * 1000;

export const DRAFT_POSTS: PostCardData[] = [
  {
    id: "sp_1",
    content:
      "Our summer sale starts tomorrow — 20% off everything in the new collection. Tap the link in bio to shop early access before it goes live to everyone else.",
    images: ["/mock/post-1a.jpg", "/mock/post-1b.jpg"],
    status: "DRAFT",
    scheduleAt: new Date(hours(3)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_ig",
      channelType: "INSTAGRAM",
      handle: "@northwind.co",
      profileImage: "/mock/avatar-ig.jpg",
    },
  },
  {
    id: "sp_2",
    content:
      "Behind the scenes from this week's photoshoot. Swipe through to see how the team pulled together the new lookbook in under 48 hours.",
    images: ["/mock/post-2a.jpg"],
    status: "DRAFT",
    scheduleAt: new Date(hours(26)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_fb",
      channelType: "FACEBOOK",
      handle: "Northwind Co.",
      profileImage: "/mock/avatar-fb.jpg",
    },
  },
  {
    id: "sp_3",
    content:
      "Hot take: most onboarding emails fail in the first three lines. Here's the framework we use for every welcome sequence we ship for clients.",
    images: [],
    status: "DRAFT",
    scheduleAt: new Date(hours(0.4)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_li",
      channelType: "LINKEDIN",
      handle: "Northwind Co.",
      profileImage: "/mock/avatar-li.jpg",
    },
  },
  {
    id: "sp_4",
    content:
      "Quick poll for the timeline: cold brew or matcha for a 6am shoot day? Asking for the whole team because we cannot agree.",
    images: [],
    status: "DRAFT",
    scheduleAt: new Date(hours(50)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_tw",
      channelType: "TWITTER",
      handle: "@northwindco",
      profileImage: "/mock/avatar-tw.jpg",
    },
  },
  {
    id: "sp_5",
    content:
      "30 seconds, one cut, zero budget. Here's how we shot this week's product teaser using nothing but a window and a tripod.",
    images: ["/mock/post-5a.jpg"],
    status: "DRAFT",
    scheduleAt: new Date(hours(8)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_tt",
      channelType: "TIKTOK",
      handle: "@northwind.co",
      profileImage: "/mock/avatar-tt.jpg",
    },
  },
];

export const PUBLISHED_POSTS: PostCardData[] = [
  {
    id: "sp_10",
    content:
      "We just crossed 10,000 customers. Thank you to everyone who trusted us early — this one's for you.",
    images: ["/mock/post-10a.jpg"],
    status: "PUBLISHED",
    scheduleAt: new Date(hours(-26)).toISOString(),
    timezone: "America/New_York",
    publishAt: new Date(hours(-26)).toISOString(),
    publishUrl: "https://instagram.com/p/mock10",
    channel: {
      id: "ch_ig",
      channelType: "INSTAGRAM",
      handle: "@northwind.co",
      profileImage: "/mock/avatar-ig.jpg",
    },
  },
  {
    id: "sp_11",
    content:
      "Our founder sat down with Build Weekly to talk about the first eighteen months of bootstrapping. Link in the comments.",
    images: [],
    status: "PUBLISHED",
    scheduleAt: new Date(hours(-50)).toISOString(),
    timezone: "America/New_York",
    publishAt: new Date(hours(-50)).toISOString(),
    publishUrl: "https://linkedin.com/posts/mock11",
    channel: {
      id: "ch_li",
      channelType: "LINKEDIN",
      handle: "Northwind Co.",
      profileImage: "/mock/avatar-li.jpg",
    },
  },
  {
    id: "sp_12",
    content:
      "Restocked. The waitlist drop goes out in batches starting now — check your inbox if you signed up last month.",
    images: ["/mock/post-12a.jpg", "/mock/post-12b.jpg", "/mock/post-12c.jpg"],
    status: "FAILED",
    scheduleAt: new Date(hours(-5)).toISOString(),
    timezone: "America/New_York",
    publishAt: null,
    publishUrl: null,
    channel: {
      id: "ch_fb",
      channelType: "FACEBOOK",
      handle: "Northwind Co.",
      profileImage: "/mock/avatar-fb.jpg",
    },
  },
  {
    id: "sp_13",
    content:
      "New tutorial: how we use cohort retention curves to decide which features actually deserve more engineering time.",
    images: [],
    status: "PUBLISHED",
    scheduleAt: new Date(hours(-100)).toISOString(),
    timezone: "America/New_York",
    publishAt: new Date(hours(-100)).toISOString(),
    publishUrl: "https://twitter.com/northwindco/status/mock13",
    channel: {
      id: "ch_tw",
      channelType: "TWITTER",
      handle: "@northwindco",
      profileImage: "/mock/avatar-tw.jpg",
    },
  },
  {
    id: "sp_14",
    content:
      "Posted to Instagram and TikTok, still pending review on Facebook — partial run, retrying the remaining channel shortly.",
    images: ["/mock/post-14a.jpg"],
    status: "PARTIALLY_PUBLISHED",
    scheduleAt: new Date(hours(-2)).toISOString(),
    timezone: "America/New_York",
    publishAt: new Date(hours(-2)).toISOString(),
    publishUrl: "https://tiktok.com/@northwind.co/video/mock14",
    channel: {
      id: "ch_tt",
      channelType: "TIKTOK",
      handle: "@northwind.co",
      profileImage: "/mock/avatar-tt.jpg",
    },
  },
  {
    id: "sp_15",
    content:
      "A short thread on what changed in our pricing page after running five rounds of user interviews this spring.",
    images: [],
    status: "PUBLISHED",
    scheduleAt: new Date(hours(-200)).toISOString(),
    timezone: "America/New_York",
    publishAt: new Date(hours(-200)).toISOString(),
    publishUrl: "https://twitter.com/northwindco/status/mock15",
    channel: {
      id: "ch_tw",
      channelType: "TWITTER",
      handle: "@northwindco",
      profileImage: "/mock/avatar-tw.jpg",
    },
  },
];
