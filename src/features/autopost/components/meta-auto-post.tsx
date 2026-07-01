"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTRPC } from "../../../trpc/client";
import { useState, useRef } from "react";

export function MetaAutoPost() {
  const trpc = useTRPC();
  const { data: connection } = useSuspenseQuery(trpc.meta.getConnection.queryOptions());

  const postMutation = useMutation(trpc.meta.postToPage.mutationOptions({
    onSuccess: (data) => alert(`Posted! Post ID: ${data.postId}`),
    onError: (err) => alert("Post failed: " + err.message),
  }));

  const postPhotoMutation = useMutation(trpc.meta.postPhotoToPage.mutationOptions({
    onSuccess: (data) => alert(`Posted! Post ID: ${data.postId}`),
    onError: (err) => alert("Post failed: " + err.message),
  }));

  const [selectedPageId, setSelectedPageId] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = postMutation.isPending || postPhotoMutation.isPending;

  if (!connection?.connected) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (imageFile && imagePreview) {
      postPhotoMutation.mutate({
        pageId: selectedPageId,
        message: message,
        imageBase64: imagePreview,
      });
    } else {
      postMutation.mutate({ pageId: selectedPageId, message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-8">
      <h2 className="text-xl font-semibold">Post to Facebook Page</h2>

      <select
        value={selectedPageId}
        onChange={(e) => setSelectedPageId(e.target.value)}
        required
        className="w-full border p-2 rounded"
      >
        <option value="">-- Select a page --</option>
        {connection.pages.map((p) => (
          <option key={p.pageId} value={p.pageId}>{p.pageName}</option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        required={!imageFile}
        className="w-full border p-2 rounded"
        placeholder="What's on your mind?"
      />

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded text-sm"
        />

        {imagePreview && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="h-32 rounded border object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 text-xs"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Posting…" : imageFile ? "Post Photo" : "Post to Page"}
      </Button>
    </form>
  );
}