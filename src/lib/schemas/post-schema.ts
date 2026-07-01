import { z } from "zod";
import { PostType as PrismaPostType } from "../../generated/prisma/enums";

/* ----------------------------------------------------------------------- */
/*  Enums                                                                   */
/* ----------------------------------------------------------------------- */

export const PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "LINKEDIN",
  "TWITTER",
  "TIKTOK",
] as const;

export const POST_TYPES = [
  "PROMOTIONAL",
  "ANNOUNCEMENT",
  "ENGAGEMENT",
  "EDUCATIONAL",
  "BEHIND_THE_SCENES",
  "TESTIMONIAL",
  "SEASONAL",
] as const;

export const TONES = [
  "FRIENDLY",
  "PROFESSIONAL",
  "WITTY",
  "LUXURY",
  "BOLD",
  "CASUAL",
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type PostType = (typeof POST_TYPES)[number];
export type Tone = (typeof TONES)[number];

/* ----------------------------------------------------------------------- */
/*  Form schema                                                             */
/* ----------------------------------------------------------------------- */

export const postBriefSchema = z.object({
  businessName: z
    .string()
    .trim()
    .max(80, "Keep the business name under 80 characters.")
    .optional()
    .default(""),

  niche: z
    .string()
    .trim()
    .min(10, "Describe the business in a bit more detail (10+ characters) so posts make sense.")
    .max(500, "Keep this under 500 characters."),

  audience: z
    .string()
    .trim()
    .max(200, "Keep this under 200 characters.")
    .optional()
    .default(""),

  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "Select at least one platform."),

  postType: z.enum(POST_TYPES),

  tone: z.enum(TONES),

  postCount: z
    .number()
    .int("Must be a whole number.")
    .min(1, "At least 1 post.")
    .max(10, "10 posts max per batch."),

  keyDetails: z
    .string()
    .trim()
    .max(500, "Keep this under 500 characters.")
    .optional()
    .default(""),

  cta: z
    .string()
    .trim()
    .max(120, "Keep the call to action under 120 characters.")
    .optional()
    .default(""),

  includeHashtags: z.boolean(),
  includeEmojis: z.boolean(),
});

// zodResolver's type signature is Resolver<Input, Context, Output>:
// useForm() is driven by the *input* shape (fields as typed/optional before
// Zod applies .default()), while the validated value handed to onSubmit is
// the *output* shape (defaults applied, required fields guaranteed present).
export type PostBriefInput = z.input<typeof postBriefSchema>;
export type PostBrief = z.output<typeof postBriefSchema>;

export const DEFAULT_BRIEF: PostBriefInput = {
  businessName: "",
  niche: "",
  audience: "",
  platforms: ["INSTAGRAM", "FACEBOOK"],
  postType: PrismaPostType.PROMOTIONAL,
  tone: "FRIENDLY",
  postCount: 3,
  keyDetails: "",
  cta: "",
  includeHashtags: true,
  includeEmojis: true,
};

/* ----------------------------------------------------------------------- */
/*  Generated post                                                          */
/* ----------------------------------------------------------------------- */

export const generatedPostSchema = z.object({
  id: z.string(),
  platform: z.enum(PLATFORMS),
  content: z.string(),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;

/* ----------------------------------------------------------------------- */
/*  Display metadata (kept separate from the schema — labels are UI         */
/*  concerns, not validation concerns)                                      */
/* ----------------------------------------------------------------------- */

export const PLATFORM_META: Record<Platform, { label: string; note: string }> = {
  FACEBOOK: { label: "Facebook", note: "Conversational, link-friendly" },
  INSTAGRAM: { label: "Instagram", note: "Visual-first, hashtag heavy" },
  LINKEDIN: { label: "LinkedIn", note: "Professional, value-led" },
  TWITTER: { label: "X / Twitter", note: "Short, punchy, no fluff" },
  TIKTOK: { label: "TikTok caption", note: "Hooky, trend-aware" },
};

export const POST_TYPE_META: Record<PrismaPostType, { label: string; hint: string }> = {
  PROMOTIONAL: { label: "Promotional", hint: "Push an offer, product, or service" },
  EDUCATIONAL: { label: "Educational", hint: "Teach a tip, fact, or how-to" },
  ENGAGEMENT: { label: "Engagement", hint: "Question or poll to spark comments" },
  TESTIMONIAL: { label: "Testimonial", hint: "Spotlight a review or result" },
  ANNOUNCEMENT: { label: "Announcement", hint: "News, launch, or update" },
  BEHIND_THE_SCENES: { label: "Behind the scenes", hint: "Show the people or process" },
  SEASONAL: { label: "Seasonal / holiday", hint: "Tie to a date or event" },
};

export const TONE_META: Record<Tone, { label: string }> = {
  FRIENDLY: { label: "Friendly" },
  PROFESSIONAL: { label: "Professional" },
  WITTY: { label: "Witty" },
  LUXURY: { label: "Luxury" },
  BOLD: { label: "Bold" },
  CASUAL: { label: "Casual" },
};

export const PLATFORM_RULES: Record<Platform, string> = {
  FACEBOOK:
    "Facebook: 1-3 short paragraphs, conversational, fine to include a link placeholder, light use of line breaks for readability.",
  INSTAGRAM:
    "Instagram: strong scroll-stopping first line, short lines, end with a line break before hashtags, hashtags grouped at the end.",
  LINKEDIN:
    "LinkedIn: lead with a hook or insight, professional but human, no excessive emojis, structured with line breaks, end with a discussion question or soft CTA.",
  TWITTER:
    "X/Twitter: under 280 characters, one clear idea, punchy and direct, minimal hashtags (0-2).",
  TIKTOK:
    "TikTok caption: very short, casual, hooky first line, written to accompany video not stand alone, trend-aware language.",
};