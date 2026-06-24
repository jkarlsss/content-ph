// lib/schemas/post.ts
import * as z from "zod"; // v4 namespace import — matches current shadcn docs

export const createPostSchema = z.object({
  organizationId: z.string(),
  content: z
    .string()
    .min(1, "Post content can't be empty.")
    .max(5000, "Max 5000 characters."),
  mediaUrls: z.array(z.url()).optional(), // z.url() — top-level function in v4, not .string().url()
  scheduledAt: z.date({ error: "Pick a date and time." }), // unified `error` param replaces required_error
  socialAccountIds: z.array(z.string()).min(1, "Select at least one platform."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;