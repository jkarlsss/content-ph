import { ChannelType } from "../../generated/prisma/enums";

function createProvider(type: ChannelType) {

  throw new Error("Not implemented");
}

const PROVIDERS: Record<ChannelType, void> = {
  [ChannelType.INSTAGRAM]: createProvider(ChannelType.INSTAGRAM),
  [ChannelType.TWITTER]: createProvider(ChannelType.TWITTER),
  [ChannelType.FACEBOOK]: createProvider(ChannelType.FACEBOOK),
}

export function getOAuthProvider(type: ChannelType) {
  return PROVIDERS[type];
}