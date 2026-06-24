import { createTRPCRouter } from "../init";
import { organizationsRouter } from "./organizations";
import { postsRouter } from "./posts";
import { socialAccountsRouter } from "./social-accounts";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  socialAccounts: socialAccountsRouter,
  posts: postsRouter,
  organizations: organizationsRouter,
  users: usersRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
