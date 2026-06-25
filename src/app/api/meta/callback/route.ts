// app/api/meta/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchMetaUserId,
} from "@/lib/meta-oauth";
import prisma from "../../../../lib/prisma";
import { encrypt } from "../../../../lib/encryption";
import { inngest, metaConnectionCreated } from "../../../../inngest/client";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/settings/integrations?meta_error=${encodeURIComponent(reason)}`);

  if (oauthError) return fail(oauthError);
  if (!code || !state) return fail("missing_code_or_state");

  // Validate CSRF state — single use, must exist and not be expired.
  const stateRow = await prisma.metaOAuthState.findUnique({ where: { state } });
  if (!stateRow || stateRow.expiresAt < new Date()) {
    return fail("invalid_or_expired_state");
  }
  // Consume immediately so it can't be replayed.
  await prisma.metaOAuthState.delete({ where: { state } });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`;

  try {
    const shortLived = await exchangeCodeForToken(code, redirectUri);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);
    const metaUserId = await fetchMetaUserId(longLived.access_token);

    const tokenExpiresAt = new Date(Date.now() + longLived.expires_in * 1000);

    const connection = await prisma.metaConnection.upsert({
      where: { userId: stateRow.userId },
      create: {
        userId: stateRow.userId,
        metaUserId,
        accessTokenEnc: encrypt(longLived.access_token),
        tokenExpiresAt,
        scopes: [],
        status: "ACTIVE",
      },
      update: {
        metaUserId,
        accessTokenEnc: encrypt(longLived.access_token),
        tokenExpiresAt,
        status: "ACTIVE",
        lastError: null,
      },
    });

    // Hand off the slow part (fetching pages + IG accounts) to Inngest so
    // this redirect comes back fast and retries happen automatically if
    // Meta's API hiccups.
    await inngest.send(
      metaConnectionCreated.create({ connectionId: connection.id, userId: stateRow.userId })
    );

    const dest = stateRow.redirectAfter ?? "/settings/integrations";
    return NextResponse.redirect(`${origin}${dest}?meta_connected=1`);
  } catch (err) {
    console.error("[meta-oauth-callback]", err);
    return fail("token_exchange_failed");
  }
}