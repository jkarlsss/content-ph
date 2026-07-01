import { google } from "@ai-sdk/google";
import { TRPCError } from "@trpc/server";
import { generateText, Output } from "ai";
import { z } from "zod";

import { Platform } from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";
import { createTRPCRouter, protectedProcedure } from "../init";

/* -------------------------------------------------------------------------
   Input schemas
   -------------------------------------------------------------------------
   These mirror the Idea Prisma model (and, by extension, PostBrief from
   lib/schemas/post-schema.ts). Kept local to the router rather than
   importing the Prisma-generated enums directly, so the router's input
   contract doesn't silently change shape if the generated client output
   path moves.

   If you'd rather have a single source of truth, swap these `z.enum([...])`
   calls for `z.nativeEnum(Platform)` etc. from your generated Prisma client,
   or import PLATFORMS/POST_TYPES/TONES from post-schema.ts directly.

   NOTE: post-schema.ts's POST_TYPES/TONES are kept in sync with the enums
   below by hand. This router is the source of truth for those value sets —
   if you change them here, mirror the change in post-schema.ts.
------------------------------------------------------------------------- */

const platformEnum = z.enum(Platform);

const postTypeEnum = z.enum([
  "PROMOTIONAL",
  "ANNOUNCEMENT",
  "ENGAGEMENT",
  "EDUCATIONAL",
  "BEHIND_THE_SCENES",
  'TESTIMONIAL',
"SEASONAL"
]);

const toneEnum = z.enum([
  "PROFESSIONAL",
  "CASUAL",
  "PLAYFUL",
  "LUXURY",
  "URGENT",
  "BOLD",
  "FRIENDLY",
  "WITTY"
]);

const generatedPostSchema = z.object({
  id: z.string(),
  platform: platformEnum,
  content: z.string(),
});

const ideaBriefInput = z.object({
  title: z.string().min(1, "Give this idea a name."),
  businessName: z.string().optional(),
  niche: z.string().min(1, "Describe what the business does."),
  audience: z.string().optional(),
  platforms: z.array(platformEnum).min(1, "Select at least one platform."),
  postType: postTypeEnum,
  tone: toneEnum,
  postCount: z.number().int().min(1).max(10).default(1),
  keyDetails: z.string().optional(),
  cta: z.string().optional(),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  generatedPosts: z.array(generatedPostSchema).optional(),
});

const updateInput = ideaBriefInput.partial().extend({
  id: z.string(),
});

/* -------------------------------------------------------------------------
   Generation input — everything `generate` needs to build the prompt, minus
   the bookkeeping fields (`title`, `generatedPosts`) that only matter once
   we're persisting an Idea. Kept separate from ideaBriefInput rather than
   reusing it via `.omit()` so this procedure's contract doesn't shift if
   the persistence shape grows fields unrelated to prompt construction.
------------------------------------------------------------------------- */

const generateInput = z.object({
  businessName: z.string().optional(),
  niche: z.string().min(1, "Describe what the business does."),
  audience: z.string().optional(),
  platforms: z.array(platformEnum).min(1, "Select at least one platform."),
  postType: postTypeEnum,
  tone: toneEnum,
  postCount: z.number().int().min(1).max(10).default(1),
  keyDetails: z.string().optional(),
  cta: z.string().optional(),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
});

// Keyed off the literal platform strings (not `typeof Platform`) since the
// exact runtime/type shape Prisma generates for `Platform` isn't something
// this file can verify — z.enum(Platform) only needs Platform to be
// enum-like, not any particular TS shape. If you add a platform, add it to
// the Prisma schema's Platform enum AND here.
const PLATFORM_RULES: Record<
  Platform,
  string
> = {
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

function buildPrompt(brief: z.infer<typeof generateInput>): string {
  const platformList = brief.platforms.join(", ");
  const platformRules = brief.platforms
    .map((p) => `- ${PLATFORM_RULES[p]}`)
    .join("\n");

  const lines: string[] = [
    `You are a social media copywriter. Write ${brief.postCount} distinct social media post${
      brief.postCount > 1 ? "s" : ""
    } for the following business.`,
    "",
    `Business name: ${brief.businessName || "(not provided)"}`,
    `Niche / industry: ${brief.niche}`,
  ];

  if (brief.audience) lines.push(`Target audience: ${brief.audience}`);

  lines.push(
    "",
    `Post type / goal: ${brief.postType}`,
    `Tone of voice: ${brief.tone}`,
    `Target platform(s): ${platformList}`,
    "",
    "Platform-specific rules to follow:",
    platformRules,
    "",
  );

  if (brief.keyDetails) {
    lines.push(
      `Key details to weave in (offers, dates, links, names, promo codes): ${brief.keyDetails}`,
    );
  }
  if (brief.cta) lines.push(`Call to action: ${brief.cta}`);

  lines.push(
    "",
    `Hashtags: ${
      brief.includeHashtags
        ? "include relevant, specific hashtags (not generic spam tags)"
        : "do not include hashtags"
    }.`,
    `Emojis: ${
      brief.includeEmojis ? "use emojis sparingly and naturally" : "do not use emojis"
    }.`,
    "",
    `Generate one post per platform per round, for ${brief.postCount} round${
      brief.postCount > 1 ? "s" : ""
    }, respecting each platform's rules above. Vary the angle/hook between rounds so they don't feel repetitive.`,
  );

  return lines.join("\n");
}

/* -------------------------------------------------------------------------
   Router
------------------------------------------------------------------------- */

export const ideasRouter = createTRPCRouter({
  // List all ideas owned by the current user, newest first.
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.idea.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Fetch a single idea by id. Throws NOT_FOUND if it doesn't exist or
  // doesn't belong to the current user (we don't leak existence either way).
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const idea = await prisma.idea.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!idea) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found.",
        });
      }

      return idea;
    }),

  // Generate draft posts from a brief using Gemini, via the Vercel AI SDK's
  // generateObject (structured output validated against generatedPostSchema
  // server-side, so a malformed model response can't leak to the client).
  // This does NOT persist anything — call `create`/`update` afterward with
  // the returned `posts` to save them.
  generate: protectedProcedure
    .input(generateInput)
    .mutation(async ({ input }) => {
      const prompt = buildPrompt(input);

      let posts: z.infer<typeof generatedPostSchema>[];
      try {
        const result = await generateText({
          model: google("gemini-2.5-flash"),
          output: Output.object({

          schema: z.object({
            posts: z
              .array(
                z.object({
                  platform: platformEnum,
                  content: z.string(),
                }),
              )
              .describe(
                "One entry per platform per round. Do not include an id — the server assigns it.",
              ),
          }),
          }),
          prompt,
        });
        posts = result.output.posts.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
        }));
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Couldn't generate posts right now. Please try again.",
          cause: err,
        });
      }

      return { posts, prompt };
    }),

  // Save a new idea from the current brief (+ optional last-generated drafts).
  create: protectedProcedure
    .input(ideaBriefInput)
    .mutation(async ({ ctx, input }) => {
      return prisma.idea.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update an existing idea.
  //
  // Note: `id` alone is the model's @id, so `update`/`delete` can't take a
  // `where: { id, userId }` filter directly — Prisma's unique `where` only
  // accepts fields that form an actual unique constraint, and `id` + `userId`
  // together aren't one here. updateMany accepts an arbitrary filter, so we
  // use that to enforce ownership in the same query (atomic, no separate
  // fetch-then-check, no race condition), then check `count` to know whether
  // a row actually matched.
  update: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const result = await prisma.idea.updateMany({
        where: { id, userId: ctx.session.user.id },
        data,
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found.",
        });
      }

      // updateMany doesn't return the updated row, so fetch it back.
      // Safe to assume it exists and still belongs to this user — nothing
      // else could have reassigned ownership between the two calls.
      return prisma.idea.findFirstOrThrow({
        where: { id, userId: ctx.session.user.id },
      });
    }),

  // Delete an idea. Same ownership-via-filter approach as update, using
  // deleteMany for the same reason: `where: { id, userId }` isn't a valid
  // unique filter for `delete`.
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.idea.deleteMany({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found.",
        });
      }

      return { id: input.id };
    }),
});