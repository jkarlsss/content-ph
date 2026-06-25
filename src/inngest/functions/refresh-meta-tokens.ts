// server/inngest/functions/refresh-meta-tokens.ts
import { decrypt, encrypt } from "../../lib/encryption";
import prisma from "../../lib/prisma";
import { inngest } from "../client";
import { exchangeForLongLivedToken } from "@/lib/meta-oauth";

// Meta's long-lived user tokens last ~60 days, and re-exchanging a still-valid
// long-lived token for a fresh one just resets that clock — no user
// interaction needed, as long as we do it before expiry. Run daily and
// refresh anything expiring within the next 7 days.
export const refreshMetaTokens = inngest.createFunction(
  {
    id: "refresh-meta-tokens",
    retries: 2,
    triggers: { cron: "0 6 * * *" }, // 06:00 UTC daily
  },
  async ({ step }) => {
    const expiringSoon = await step.run("find-expiring-connections", () =>
      prisma.metaConnection.findMany({
        where: {
          status: "ACTIVE",
          tokenExpiresAt: { lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, accessTokenEnc: true },
      })
    );

    const results = await Promise.all(
      expiringSoon.map((conn) =>
        step.run(`refresh-${conn.id}`, async () => {
          try {
            const current = decrypt(conn.accessTokenEnc);
            const refreshed = await exchangeForLongLivedToken(current);
            await prisma.metaConnection.update({
              where: { id: conn.id },
              data: {
                accessTokenEnc: encrypt(refreshed.access_token),
                tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
                lastError: null,
              },
            });
            return { id: conn.id, ok: true };
          } catch (err) {
            // Refresh fails if the user revoked access on Facebook's side —
            // flag for reconnect rather than retrying indefinitely.
            await prisma.metaConnection.update({
              where: { id: conn.id },
              data: {
                status: "NEEDS_REAUTH",
                lastError: err instanceof Error ? err.message : "Token refresh failed",
              },
            });
            return { id: conn.id, ok: false };
          }
        })
      )
    );

    return {
      checked: expiringSoon.length,
      refreshed: results.filter((r) => r.ok).length,
      needsReauth: results.filter((r) => !r.ok).length,
    };
  }
);