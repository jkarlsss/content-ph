"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  postBriefSchema,
  DEFAULT_BRIEF,
  PLATFORMS,
  POST_TYPES,
  TONES,
  PLATFORM_META,
  POST_TYPE_META,
  TONE_META,
  PLATFORM_RULES,
  type PostBrief,
  type PostBriefInput,
  type Platform,
  type GeneratedPost,
} from "../../../lib/schemas/post-schema";
import { useTRPC } from "../../../trpc/client";
import { toast } from "sonner";

/* ----------------------------------------------------------------------- */
/*  Post status                                                            */
/*  "draft"     -> generated, not yet saved anywhere durable               */
/*  "saved"     -> persisted as a draft (idea created/updated)             */
/*  "published" -> sent live to Facebook AND persisted                    */
/* ----------------------------------------------------------------------- */
type PostStatus = "draft" | "saving" | "saved" | "publishing" | "published";

type StudioPost = GeneratedPost & { status: PostStatus; pageId: string };

const STATUS_META: Record<
  PostStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Unsaved",
    className: "border-zinc-200 bg-zinc-50 text-zinc-600",
  },
  saving: {
    label: "Saving…",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  saved: {
    label: "Saved",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  publishing: {
    label: "Publishing…",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  published: {
    label: "Published",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

/* ----------------------------------------------------------------------- */
/*  Prompt preview — purely cosmetic now. The *real* prompt is built        */
/*  server-side in ideas.generate so the model + prompt logic live in one  */
/*  place; this mirrors that logic just closely enough to show the user    */
/*  roughly what will be sent, without being the source of truth.          */
/* ----------------------------------------------------------------------- */

function buildPromptPreview(brief: PostBrief): string {
  const platformList = brief.platforms
    .map((p) => PLATFORM_META[p].label)
    .join(", ");

  const platformRules = brief.platforms
    .map((p) => `- ${PLATFORM_RULES[p]}`)
    .join("\n");

  const lines: string[] = [];

  lines.push(
    `You are a social media copywriter. Write ${brief.postCount} distinct social media post${
      brief.postCount > 1 ? "s" : ""
    } for the following business.`
  );
  lines.push("");
  lines.push(`Business name: ${brief.businessName || "(not provided)"}`);
  lines.push(`Niche / industry: ${brief.niche}`);
  if (brief.audience) {
    lines.push(`Target audience: ${brief.audience}`);
  }
  lines.push("");
  lines.push(`Post type / goal: ${POST_TYPE_META[brief.postType].label}`);
  lines.push(`Tone of voice: ${TONE_META[brief.tone].label}`);
  lines.push(`Target platform(s): ${platformList}`);
  lines.push("");
  lines.push("Platform-specific rules to follow:");
  lines.push(platformRules);
  lines.push("");
  if (brief.keyDetails) {
    lines.push(
      `Key details to weave in (offers, dates, links, names, promo codes): ${brief.keyDetails}`
    );
  }
  if (brief.cta) {
    lines.push(`Call to action: ${brief.cta}`);
  }
  lines.push("");
  lines.push(
    `Hashtags: ${
      brief.includeHashtags
        ? "include relevant, specific hashtags (not generic spam tags)"
        : "do not include hashtags"
    }.`
  );
  lines.push(
    `Emojis: ${
      brief.includeEmojis ? "use emojis sparingly and naturally" : "do not use emojis"
    }.`
  );
  lines.push("");
  lines.push(
    `If multiple platforms are selected, generate a version for each platform per post, respecting that platform's rules above. Vary the angle/hook between the ${brief.postCount} post${
      brief.postCount > 1 ? "s" : ""
    } so they don't feel repetitive. Return only the post copy, no explanations or labels.`
  );

  return lines.join("\n");
}

/* ----------------------------------------------------------------------- */
/*  Component                                                               */
/* ----------------------------------------------------------------------- */

export default function PostGenerator() {
  const trpc = useTRPC();

  // Meta connection — used to populate the per-card page selector.
  // Suspense query: this component will suspend until the connection
  // status resolves, consistent with how MetaAutoPost reads it.
  const { data: metaConnection } = useSuspenseQuery(
    trpc.meta.getConnection.queryOptions()
  );
  const metaPages = metaConnection?.connected ? metaConnection.pages : [];
  const hasMetaConnection = metaPages.length > 0;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PostBriefInput, unknown, PostBrief>({
    resolver: zodResolver(postBriefSchema),
    defaultValues: DEFAULT_BRIEF,
    mode: "onChange",
  });

  const [posts, setPosts] = useState<StudioPost[]>([]);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Watch the whole form so the prompt preview stays live as the user types.
  const liveValues = watch();
  const promptPreview = useMemo(() => {
    const parsed = postBriefSchema.safeParse(liveValues);
    return parsed.success ? buildPromptPreview(parsed.data) : null;
  }, [liveValues]);

  /* -----------------------------------------------------------------
     Mutations
  ----------------------------------------------------------------- */

  const generateMutation = useMutation(
    trpc.ideas.generate.mutationOptions({
      onError: (err) => {
        setSubmitError(err.message ?? "Something went wrong generating posts. Try again.");
      },
    })
  );

  const createMutation = useMutation(trpc.ideas.create.mutationOptions());

  const updateMutation = useMutation(trpc.ideas.update.mutationOptions());

  // Plain mutation (no form state) — Publish pushes the post's current
  // content + chosen page straight to Facebook via the Meta integration.
  const metaPostMutation = useMutation(trpc.meta.postToPage.mutationOptions());

  function togglePlatform(platform: Platform) {
    const current = getValues("platforms");
    const next = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setValue("platforms", next, { shouldValidate: true });
  }

  function updatePostContent(id: string, content: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              content,
              // Editing a saved/published post moves it back to draft —
              // it no longer matches what was last persisted.
              status:
                p.status === "saved" || p.status === "published"
                  ? "draft"
                  : p.status,
            }
          : p
      )
    );
  }

  function updatePostPageId(id: string, pageId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pageId } : p))
    );
  }

  /* -----------------------------------------------------------------
     Persist the current idea (brief + whatever posts are in state right
     now) via ideas.create the first time, then ideas.update afterward.
     Returns the idea id so the caller can stash it.
  ----------------------------------------------------------------- */
  async function persistIdea(brief: PostBrief, currentPosts: StudioPost[]) {
    const generatedPosts = currentPosts.map(({ id, platform, content }) => ({
      id,
      platform,
      content,
    }));

    if (!ideaId) {
      const created = await createMutation.mutateAsync({
        title: brief.businessName || brief.niche.slice(0, 60) || "Untitled idea",
        businessName: brief.businessName,
        niche: brief.niche,
        audience: brief.audience,
        platforms: brief.platforms,
        postType: brief.postType,
        tone: brief.tone,
        postCount: brief.postCount,
        keyDetails: brief.keyDetails,
        cta: brief.cta,
        includeHashtags: brief.includeHashtags,
        includeEmojis: brief.includeEmojis,
        generatedPosts,
      });
      setIdeaId(created.id);
      return created.id;
    }

    await updateMutation.mutateAsync({
      id: ideaId,
      generatedPosts,
    });
    return ideaId;
  }

  async function handleSaveDraft(post: StudioPost) {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: "saving" } : p))
    );

    try {
      const brief = postBriefSchema.parse(getValues());
      const nextPosts = posts.map((p) =>
        p.id === post.id ? { ...p, status: "saved" as const } : p
      );
      await persistIdea(brief, nextPosts);
      setPosts(nextPosts);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: "draft" } : p))
      );
      setSubmitError("Couldn't save that draft. Try again.");
    }
  }

  /* -----------------------------------------------------------------
     Publish = persist to our DB (same as save) + push live to the
     selected Facebook Page. Both must succeed for "published".
     If the DB save succeeds but the Meta call fails, the post is left
     "saved" (not reverted to "draft") since the content IS safely
     persisted — it just isn't live on Facebook yet.
  ----------------------------------------------------------------- */
  async function handlePublish(post: StudioPost) {
    if (!post.pageId) {
      setSubmitError("Select a Facebook Page for this post before publishing.");
      return;
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: "publishing" } : p))
    );

    let nextPosts: StudioPost[];

    try {
      const brief = postBriefSchema.parse(getValues());
      nextPosts = posts.map((p) =>
        p.id === post.id ? { ...p, status: "saved" as const } : p
      );
      await persistIdea(brief, nextPosts);
      setPosts(nextPosts);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: "draft" } : p))
      );
      setSubmitError("Couldn't save that post before publishing. Try again.");
      return;
    }

    try {
      await metaPostMutation.mutateAsync({
        pageId: post.pageId,
        message: post.content,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: "published" as const } : p
        )
      );
    } catch (err) {
      // Leave status as "saved" — the content is safely persisted in our
      // own DB, it just didn't make it to Facebook.
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: "saved" } : p))
      );
      setSubmitError(
        err instanceof Error
          ? `Saved, but publishing to Facebook failed: ${err.message}`
          : "Saved, but publishing to Facebook failed. Try again."
      );
    }
  }

  async function onSubmit(brief: PostBrief) {
    setSubmitError(null);

    try {
      const { posts: generated } = await generateMutation.mutateAsync({
        businessName: brief.businessName,
        niche: brief.niche,
        audience: brief.audience,
        platforms: brief.platforms,
        postType: brief.postType,
        tone: brief.tone,
        postCount: brief.postCount,
        keyDetails: brief.keyDetails,
        cta: brief.cta,
        includeHashtags: brief.includeHashtags,
        includeEmojis: brief.includeEmojis,
      });

      const defaultPageId = hasMetaConnection ? metaPages[0].pageId : "";

      const newPosts: StudioPost[] = generated.map((p) => ({
        ...p,
        status: "draft" as const,
        pageId: defaultPageId,
      }));

      setPosts(newPosts);
      // Starting a new generation invalidates whatever idea record we had —
      // the brief may have changed entirely. The next save creates a fresh
      // Idea rather than overwriting the old one.
      setIdeaId(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating posts. Try again."
      );
    }
  }

  const selectedPlatforms = watch("platforms");
  const postCount = watch("postCount");
  const isGenerating = generateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white px-6 py-10">
      <header className="mx-auto mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-orange-700">
          <Sparkles className="h-3.5 w-3.5" />
          Content studio
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Post Generator
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Set the brief once. Get on-brand drafts for every platform — edit
          inline, save what&apos;s not ready, and publish what is.
        </p>
      </header>

      <div className="mx-auto grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* ------------------------------------------------------------ */}
        {/* LEFT: the brief / parameter form                              */}
        {/* ------------------------------------------------------------ */}
        <Card className="border-zinc-200/80 shadow-sm lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Brief</CardTitle>
            <CardDescription>The more specific, the better the drafts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Controller
                  control={control}
                  name="businessName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Business name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Cebu Coastal Coffee Co."
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="niche"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        What does the business do?{" "}
                        <span className="text-orange-600">*</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={3}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Specialty coffee shop serving locally roasted single-origin beans, known for cold brew and a cozy co-working vibe."
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="audience"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Target audience{" "}
                        <span className="text-zinc-400">(optional)</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. young professionals and students who work from cafes"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Platforms — multi-select chip group, registered manually
                    since it's not a single native input */}
                <Field data-invalid={!!errors.platforms}>
                  <FieldLabel>Platforms</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((platform) => {
                      const active = selectedPlatforms?.includes(platform);
                      const meta = PLATFORM_META[platform];
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          aria-pressed={active}
                          className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 ${
                            active
                              ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500/20"
                              : "border-zinc-200 hover:border-orange-300 hover:bg-orange-50/40"
                          }`}
                        >
                          <span className="font-medium text-zinc-900">
                            {meta.label}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {meta.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.platforms && <FieldError errors={[errors.platforms]} />}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    control={control}
                    name="postType"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Post type</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            {POST_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {POST_TYPE_META[type].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          {POST_TYPE_META[field.value]?.hint}
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    control={control}
                    name="tone"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Tone</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {TONE_META[tone].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="postCount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Number of posts to generate: <strong>{postCount}</strong>
                      </FieldLabel>
                      <Slider
                        id={field.name}
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={([v]) => field.onChange(v)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="keyDetails"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Key details to include{" "}
                        <span className="text-zinc-400">(optional)</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={2}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. 20% off this weekend with code COASTAL20, new branch opening in Mandaue on July 5"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="cta"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Call to action{" "}
                        <span className="text-zinc-400">(optional)</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Visit us this weekend, DM to book a table"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <div className="flex items-center gap-6 rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2.5">
                  <Controller
                    control={control}
                    name="includeHashtags"
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Switch
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name="includeEmojis"
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Switch
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel htmlFor={field.name}>Emojis</FieldLabel>
                      </Field>
                    )}
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}

                <Field orientation="horizontal">
                  <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    type="submit"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate posts
                      </>
                    )}
                  </Button>
                </Field>

                <button
                  type="button"
                  onClick={() => setShowPromptPreview((v) => !v)}
                  className="text-left text-xs text-zinc-500 underline-offset-2 hover:underline"
                >
                  {showPromptPreview ? "Hide" : "Show"} constructed prompt
                </button>

                {showPromptPreview && (
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-zinc-900 p-3 text-[11px] leading-relaxed text-zinc-100">
                    {promptPreview ?? "Fill in the required fields to preview the prompt."}
                  </pre>
                )}
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT: generated drafts                                       */}
        {/* ------------------------------------------------------------ */}
        <div className="min-h-[500px]">
          {posts.length === 0 && !isGenerating && (
            <Card className="flex min-h-[500px] flex-1 flex-col items-center justify-center gap-2 border-dashed border-zinc-300 bg-white/60 py-16 text-center">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">No drafts yet</CardTitle>
              <CardDescription className="max-w-sm">
                Fill in the brief on the left and generate to see drafts here,
                one card per platform per post, ready to edit, save, or
                publish.
              </CardDescription>
            </Card>
          )}

          {isGenerating && (
            <Card className="flex flex-col items-center justify-center gap-3 border-dashed border-zinc-300 bg-white/60 py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              <CardTitle className="text-base">Drafting…</CardTitle>
            </Card>
          )}

          {!isGenerating && posts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {posts.map((post) => {
                const status = STATUS_META[post.status];
                const isBusy =
                  post.status === "saving" || post.status === "publishing";
                const canPublish =
                  hasMetaConnection && !!post.pageId && !isBusy && post.status !== "published";

                return (
                  <Card
                    key={post.id}
                    className="flex flex-col border-zinc-200/80 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-orange-50 text-orange-700"
                      >
                        {PLATFORM_META[post.platform].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`gap-1 ${status.className}`}
                      >
                        {post.status === "published" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
                        {status.label}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <Textarea
                        rows={8}
                        value={post.content}
                        onChange={(e) => updatePostContent(post.id, e.target.value)}
                        disabled={isBusy}
                        className="flex-1 resize-none text-sm"
                      />

                      {hasMetaConnection && (
                        <select
                          value={post.pageId}
                          onChange={(e) => updatePostPageId(post.id, e.target.value)}
                          disabled={isBusy || post.status === "published"}
                          className="w-full rounded-md border border-zinc-200 p-1.5 text-xs text-zinc-700"
                        >
                          <option value="">-- Select Facebook Page --</option>
                          {metaPages.map((page) => (
                            <option key={page.pageId} value={page.pageId}>
                              {page.pageName}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={isBusy || post.status === "saved"}
                          onClick={() => handleSaveDraft(post)}
                        >
                          <Save className="h-3.5 w-3.5" />
                          {post.status === "saved" ? "Saved" : "Save draft"}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          disabled={!canPublish}
                          title={
                            !hasMetaConnection
                              ? "Connect a Facebook Page to publish"
                              : !post.pageId
                                ? "Select a Facebook Page first"
                                : undefined
                          }
                          onClick={() => handlePublish(post)}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {post.status === "published" ? "Published" : "Publish"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}