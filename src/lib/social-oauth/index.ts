import { ChannelTypeEnum } from "../../constants/channels";

function createProvider(type: ChannelTypeEnum, options?: unknown) {

  throw new Error("Not implemented");
}
const PROVIDERS: Record<ChannelTypeEnum, void> = {
    [ChannelTypeEnum.TWITTER]: createProvider(ChannelTypeEnum.TWITTER,{ pkce: true }),
    [ChannelTypeEnum.LINKEDIN]: createProvider(ChannelTypeEnum.LINKEDIN),
    [ChannelTypeEnum.INSTAGRAM]: createProvider(ChannelTypeEnum.INSTAGRAM),
    [ChannelTypeEnum.FACEBOOK]: createProvider(ChannelTypeEnum.FACEBOOK),
    [ChannelTypeEnum.TIKTOK]: createProvider(ChannelTypeEnum.TIKTOK),
}

export function getOAuthProvider(type:ChannelTypeEnum) {
   return PROVIDERS[type];
}
