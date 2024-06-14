import {
  ConfigFile,
  ConfigFileChannel,
  ConfigFilePromotion,
} from '@/configModule/types';
import { formatChannelName } from '@/utils/formatConfig';
import { CategoryChannel, Guild } from 'discord.js';

/**
 * Delete channels that are not in the promotion config nor in the common channels
 * @param guild Guild
 * @param config ConfigFile
 * @param key Key
 * @param category CategoryChannel
 * @returns Promise<void>
 */
export default async function deleteNotFoundChannels(
  guild: Guild,
  config: ConfigFile,
  key: string,
  category: CategoryChannel,
) {
  const commonChannels = config['*'] as ConfigFileChannel[];
  const configChannels = (config[key] as ConfigFilePromotion).channels;
  const { modules } = config[key] as ConfigFilePromotion;

  const channelsToDelete = guild.channels.cache.filter((channel) => channel.parentId === category.id
    && !configChannels.some((c) => c.name === formatChannelName(channel.name))
    && !modules.some((m) => m.name === formatChannelName(channel.name))
    && !commonChannels.some((c) => c.name === formatChannelName(channel.name)));

  await Promise.allSettled(channelsToDelete.map(async (channel) => channel.delete()));
}
