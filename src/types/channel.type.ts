import { ChannelTypeEnum } from "../constants/channels";

export type ChannelType = {
  id: string;
  type: ChannelTypeEnum;
  name?: string;
  color: string;
  character_limit: number;
  userChannelId?: string | null;
  handle?: string | null;
  profile_image?: string | null;
  profile_url?: string | null;
  connected?: boolean;
}