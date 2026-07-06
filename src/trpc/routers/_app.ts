import { createTRPCRouter } from "../init";
import { channelsRouter } from "./channels";
import { ideasRouter } from "./ideas";
import { metaRouter } from "./meta";
import { organizationsRouter } from "./organizations";
import { postsRouter } from "./posts";
import { socialAccountsRouter } from "./social-accounts";
import { userChannelsRouter } from "./user-channels";
import { usersRouter } from "./users";

export const appRouter = createTRPCRouter({
  // socialAccounts: socialAccountsRouter,
  // posts: postsRouter,
  // organizations: organizationsRouter,
  // users: usersRouter,
  // meta: metaRouter,
  // userChannels: userChannelsRouter,
  // ideas: ideasRouter,
  channels: channelsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
