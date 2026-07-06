import { encrypt } from "@/lib/encryption"; // same encryption you use elsewhere
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const FACEBOOK_GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!; // e.g., https://yourapp.com

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // 1. Handle user cancellation or error
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`,
        BASE_URL,
      ),
    );
  }

  // 2. Validate state
  if (!state || !code) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=missing_params", BASE_URL),
    );
  }

  const oauthState = await prisma.metaOAuthState.findUnique({
    where: { state },
  });

  if (!oauthState || oauthState.expiresAt < new Date()) {
    return NextResponse.redirect(
      new URL(
        "/settings/integrations?error=invalid_or_expired_state",
        BASE_URL,
      ),
    );
  }

  const redirectAfter = oauthState.redirectAfter ?? "/settings/integrations";

  try {
    // 3. Exchange code for short-lived user token
    const tokenRes = await fetch(
      `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(`${BASE_URL}/api/facebook/callback`)}`,
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message ?? "Token exchange failed");
    }
    const shortLivedToken: string = tokenData.access_token;

    // 4. Exchange for long-lived token
    const longLivedRes = await fetch(
      `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `fb_exchange_token=${shortLivedToken}`,
    );
    const longLivedData = await longLivedRes.json();
    if (!longLivedRes.ok || longLivedData.error) {
      throw new Error(
        longLivedData.error?.message ?? "Long-lived token exchange failed",
      );
    }
    const longLivedToken: string = longLivedData.access_token;
    const expiresInSeconds: number = longLivedData.expires_in ?? 5184000; // ~60 days
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // 5. Fetch user's pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${longLivedToken}&limit=100`,
    );

    const pagesData = await pagesRes.json();
    if (!pagesRes.ok || pagesData.error) {
      throw new Error(pagesData.error?.message ?? "Failed to fetch pages");
    }

    const pages = pagesData.data as Array<{
      id: string;
      name: string;
      access_token: string;
      category?: string;
      instagram_business_account?: { id: string } | null;
    }>;

    // 6. Encrypt and upsert everything
    const encryptedUserToken = encrypt(longLivedToken);

    // Upsert MetaConnection
    await prisma.metaConnection.upsert({
      where: { userId: oauthState.userId },
      create: {
        userId: oauthState.userId,
        status: "ACTIVE",
        accessTokenEnc: encryptedUserToken,
        tokenExpiresAt,
        lastSyncedAt: new Date(),
      },
      update: {
        status: "ACTIVE",
        accessTokenEnc: encryptedUserToken,
        tokenExpiresAt,
        lastSyncedAt: new Date(),
        lastError: null,
      },
    });

    // For each page, upsert MetaPage
    for (const page of pages) {
      const encryptedPageToken = encrypt(page.access_token);
      await prisma.metaPage.upsert({
        where: { pageId: page.id },
        create: {
          connectionId: (await prisma.metaConnection.findUnique({
            where: { userId: oauthState.userId },
          }))!.id,
          pageId: page.id,
          pageName: page.name,
          accessTokenEnc: encryptedPageToken,
          category: page.category ?? null,
          instagramBusinessAccountId:
            page.instagram_business_account?.id ?? null,
        },
        update: {
          pageName: page.name,
          accessTokenEnc: encryptedPageToken,
          category: page.category ?? null,
          instagramBusinessAccountId:
            page.instagram_business_account?.id ?? null,
        },
      });
    }

    // 7. Delete used state
    await prisma.metaOAuthState.delete({ where: { state } });

    // 8. Redirect back to the page
    return NextResponse.redirect(new URL(redirectAfter, BASE_URL));
  } catch (err) {
    console.error("Facebook callback error:", err);
    // Update connection with error status
    if (err instanceof Error) {
      await prisma.metaConnection.upsert({
        where: { userId: oauthState.userId },
        create: {
          userId: oauthState.userId,
          status: "ERROR",
          accessTokenEnc: "",
          lastError: err.message,
        },
        update: {
          status: "ERROR",
          lastError: err.message,
        },
      });
      await prisma.metaOAuthState.delete({ where: { state } }).catch(() => {}); // best effort
      return NextResponse.redirect(
        new URL(
          `/settings/integrations?error=${encodeURIComponent(err.message)}`,
          BASE_URL,
        ),
      );
    }
  }
}

async function getRedirectFromState(state: string): Promise<string> {
  try {
    const record = await prisma.metaOAuthState.findUnique({ where: { state } });
    return record?.redirectAfter ?? "/";
  } catch {
    return "/";
  }
}
