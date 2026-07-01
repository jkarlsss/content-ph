// lib/meta-config.ts
export const GRAPH_API_VERSION = "v25.0";
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
export const IG_API_BASE = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  // "instagram_basic",
  // "instagram_content_publish",
  "business_management",
].join(",");