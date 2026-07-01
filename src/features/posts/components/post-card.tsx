"use client";

import { ImageIcon, ExternalLink, AlertTriangle, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_COLOR, PLATFORM_LABEL, PostCardData } from "../../../lib/sheduler/types";
import { formatRelativeToNow } from "../../../lib/sheduler/use-now";
import { PLATFORM_MARK } from "../../../lib/sheduler/platform-marks";

function StatusFooter({ post, now }: { post: PostCardData; now: number }) {
  switch (post.status) {
    case "DRAFT": {
      const rel = formatRelativeToNow(post.scheduleAt, now);
      return (
        <Badge variant="scheduled">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          Posts {rel}
        </Badge>
      );
    }
    case "PUBLISHED":
      return (
        <Badge variant="success">
          <span className="size-1.5 rounded-full bg-[var(--success)]" />
          Published {post.publishAt ? formatRelativeToNow(post.publishAt, now) : ""}
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="danger">
          <AlertTriangle className="size-3" />
          Failed to publish
        </Badge>
      );
    case "PARTIALLY_PUBLISHED":
      return (
        <Badge variant="warning">
          <AlertTriangle className="size-3" />
          Partially published
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral">
          {post.status.replace("_", " ").toLowerCase()}
        </Badge>
      );
  }
}

export function PostCard({ post, now }: { post: PostCardData; now: number }) {
  const Mark = PLATFORM_MARK[post.channel.channelType];
  const accent = PLATFORM_COLOR[post.channel.channelType];
  const isDraft = post.status === "DRAFT";

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 transition-colors hover:border-border-strong">
      {/* Channel row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-foreground">
            <Mark className="size-3.5" />
            <span
              className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2 ring-surface"
              style={{ background: accent }}
              aria-hidden
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">
              {post.channel.handle}
            </p>
            <p className="text-xs text-muted-dim">
              {PLATFORM_LABEL[post.channel.channelType]}
            </p>
          </div>
        </div>

        {isDraft && (
          <Button variant="ghost" size="icon" aria-label="Edit draft">
            <Pencil className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">
        {post.content}
      </p>

      {/* Media strip */}
      {post.images.length > 0 ? (
        <div className="flex gap-1.5">
          {post.images.slice(0, 3).map((src, i) => (
            <div
              key={src + i}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised"
            >
              {/* mock images — swap for real <Image> once URLs resolve */}
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="size-4 text-muted-dim" />
              </div>
            </div>
          ))}
          {post.images.length > 3 && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-surface-raised text-xs font-medium text-muted">
              +{post.images.length - 3}
            </div>
          )}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <StatusFooter post={post} now={now} />

        {post.publishUrl ? (
          <a
            href={post.publishUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            View live
            <ExternalLink className="size-3" />
          </a>
        ) : isDraft ? (
          <span className="text-xs text-muted-dim">
            {new Date(post.scheduleAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ) : post.status === "FAILED" ? (
          <Button variant="secondary" size="sm">
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
