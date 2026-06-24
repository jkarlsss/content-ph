// lib/publishers/meta.ts

const GRAPH_API = "https://graph.facebook.com/v25.0";

export async function publishToFacebook({
  pageId,
  accessToken,
  message,
  imageUrl,
  imageBuffer,
}: {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl?: string;
  imageBuffer?: Buffer;
}) {
  // Case 1: no image — plain text post
  if (!imageUrl && !imageBuffer) {
    const res = await fetch(`${GRAPH_API}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: accessToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Facebook publish failed");
    return data;
  }

  // Case 2: image via public URL
  if (imageUrl) {
    const res = await fetch(`${GRAPH_API}/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        caption: message,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Facebook image publish failed");
    return data;
  }

  // Case 3: image via raw buffer (multipart upload)
  const formData = new FormData();
  formData.append("caption", message);
  formData.append("access_token", accessToken);
  formData.append("source", new Blob([imageBuffer!] as BlobPart[]), "post-image.png");

  const res = await fetch(`${GRAPH_API}/${pageId}/photos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Facebook image publish failed");
  return data;
}