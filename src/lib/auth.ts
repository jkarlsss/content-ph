import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      // Request Page-management scopes here if you'll be posting AI content later
      scopes: [
        "email",
        "public_profile",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
      ],
      redirectURI: "http://localhost:3000/api/auth/facebook/callback"
    },
  },
});
