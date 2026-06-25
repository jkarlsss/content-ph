// lib/meta-oauth.ts
import { GRAPH_API_BASE, META_OAUTH_SCOPES } from "./meta-config";

export function buildMetaOAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: META_OAUTH_SCOPES,
    response_type: "code",
    state, // CSRF protection — verified against MetaOAuthState on callback
  });
  return `https://www.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
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
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params}`);
  if (!res.ok) throw new Error(`Long-lived exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function fetchManagedPages(longLivedUserToken: string) {
  const res = await fetch(
    `${GRAPH_API_BASE}/me/accounts?access_token=${encodeURIComponent(longLivedUserToken)}`
  );
  if (!res.ok) throw new Error(`Fetching pages failed: ${await res.text()}`);
  const data = await res.json();
  return data.data as Array<{ id: string; name: string; access_token: string }>;
}

export async function fetchInstagramAccountForPage(pageId: string, pageToken: string) {
  const res = await fetch(
    `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageToken)}`
  );
  if (!res.ok) throw new Error(`Fetching IG account failed: ${await res.text()}`);
  const data = await res.json();
  return data.instagram_business_account?.id as string | undefined;
}

/** The Meta user id ("me") for a given token — used to record metaUserId. */
export async function fetchMetaUserId(accessToken: string) {
  const res = await fetch(`${GRAPH_API_BASE}/me?fields=id&access_token=${encodeURIComponent(accessToken)}`);
  if (!res.ok) throw new Error(`Fetching me failed: ${await res.text()}`);
  const data = await res.json();
  return data.id as string;
}

/**
 * Inspect a token's live expiry/validity directly from Meta, rather than
 * trusting our locally stored expires_in math (clocks drift, users can also
 * revoke access from their FB settings without us knowing).
 * Requires an app access token (app_id|app_secret) as the inspecting token.
 */
export async function debugToken(inputToken: string) {
  const appToken = `${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`;
  const params = new URLSearchParams({ input_token: inputToken, access_token: appToken });
  const res = await fetch(`${GRAPH_API_BASE}/debug_token?${params}`);
  if (!res.ok) throw new Error(`debug_token failed: ${await res.text()}`);
  const data = await res.json();
  return data.data as { is_valid: boolean; expires_at: number; scopes: string[]; user_id: string };
}