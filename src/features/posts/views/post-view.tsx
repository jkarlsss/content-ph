"use client";

import { useMemo } from "react";
import { FileEdit, Send, Plus } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "../components/empty-post";
import { PostCard } from "../components/post-card";
import { useNow } from "../../../lib/sheduler/use-now";
import { DRAFT_POSTS, PUBLISHED_POSTS } from "../../../lib/sheduler/mock-posts";

export default function PostsView() {
  const now = useNow();

  // Drafts ordered by soonest scheduled first — that's the operationally
  // useful order when the whole point is "what fires next."
  const drafts = useMemo(
    () =>
      [...DRAFT_POSTS].sort(
        (a, b) => new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime(),
      ),
    [],
  );

  // Published ordered most-recent-first.
  const published = useMemo(
    () =>
      [...PUBLISHED_POSTS].sort(
        (a, b) => new Date(b.scheduleAt).getTime() - new Date(a.scheduleAt).getTime(),
      ),
    [],
  );

  return (
    <main className="mx-auto px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Posts
          </h1>
          <p className="mt-1 text-sm text-muted-dim">
            Everything queued up and everything that&apos;s already gone out.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          New post
        </Button>
      </div>

      <Tabs defaultValue="drafts">
        <TabsList>
          <TabsTrigger value="drafts">
            Drafts
            <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-muted-dim">
              {drafts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-muted-dim">
              {published.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          {drafts.length === 0 ? (
            <EmptyState
              icon={FileEdit}
              title="No drafts yet"
              description="Posts you save or schedule will show up here before they go out."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {drafts.map((post) => (
                <PostCard key={post.id} post={post} now={now} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published">
          {published.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Nothing published yet"
              description="Once a scheduled post goes out, it'll land here with a link to the live version."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {published.map((post) => (
                <PostCard key={post.id} post={post} now={now} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}