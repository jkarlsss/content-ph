// lib/schemas/social-account.ts
import * as z from "zod";

export const connectPagesSchema = z.object({
  organizationId: z.string(),
  selections: z
    .array(
      z.object({
        pageId: z.string(),
        pageName: z.string(),
        pageToken: z.string(),
        instagramAccountId: z.string().optional(),
        selected: z.boolean(),
      })
    )
    .refine((arr) => arr.some((s) => s.selected), {
      error: "Select at least one page to connect.", // .refine() also takes `error` now, not `message`
    }),
});

export type ConnectPagesInput = z.infer<typeof connectPagesSchema>;