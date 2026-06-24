// lib/meta-oauth.ts
import { GRAPH_API_BASE, META_OAUTH_SCOPES } from "./meta-config";

export function buildMetaOAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPES,
    response_type: "code",
    state, // CSRF protection — verify this matches on callback
  });
  return `https://www.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params}`);
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params}`);
  if (!res.ok) throw new Error(`Long-lived exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function fetchManagedPages(longLivedUserToken: string) {
  const res = await fetch(
    `${GRAPH_API_BASE}/me/accounts?access_token=${longLivedUserToken}`
  );
  if (!res.ok) throw new Error(`Fetching pages failed: ${await res.text()}`);
  const data = await res.json();
  return data.data as Array<{ id: string; name: string; access_token: string }>;
}

export async function fetchInstagramAccountForPage(pageId: string, pageToken: string) {
  const res = await fetch(
    `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
  );
  if (!res.ok) throw new Error(`Fetching IG account failed: ${await res.text()}`);
  const data = await res.json();
  return data.instagram_business_account?.id as string | undefined;
}