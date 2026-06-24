// inngest/functions/refresh-meta-tokens.ts
import { exchangeForLongLivedToken } from "@/lib/meta-oauth";
import { addDays } from "date-fns";
import { decrypt, encrypt } from "../../lib/encryption";
import prisma from "../../lib/prisma";
import { inngest } from "../client";

export const refreshMetaTokens = inngest.createFunction(
  {
    id: "refresh-meta-tokens",
    triggers: {
      cron: "0 6 * * *", // every day at 6am
    },
  },
  async ({ step }) => {
    const expiringSoon = await step.run("find-expiring", () =>
      prisma.socialAccount.findMany({
        where: {
          platform: { in: ["FACEBOOK", "INSTAGRAM"] },
          tokenExpiresAt: { lte: addDays(new Date(), 7) },
        },
      }),
    );

    for (const account of expiringSoon) {
      await step.run(`refresh-${account.id}`, async () => {
        try {
          const currentToken = decrypt(account.accessToken);
          const refreshed = await exchangeForLongLivedToken(currentToken);

          await prisma.socialAccount.update({
            where: { id: account.id },
            data: {
              accessToken: encrypt(refreshed.access_token),
              tokenExpiresAt: addDays(
                new Date(),
                Math.floor(refreshed.expires_in / 86400),
              ),
            },
          });
        } catch (err) {
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: { status: "NEEDS_RECONNECTION" },
          });
          // TODO: notify user via email/in-app
        }
      });
    }
  },
);
