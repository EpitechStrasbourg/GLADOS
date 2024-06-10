import {
  ConfigFile,
  ConfigFileChannel,
  ConfigFilePromotion,
} from '@/configModule/types';
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

  for (const channel of guild.channels.cache.values()) {
    if (channel && channel!.parentId === category.id) {
      const configChannel = configChannels.find((c) => c.name === channel!.name);
      const module = modules.find((m) => m.name === channel!.name);
      if (
        !configChannel
        && !module
        && !commonChannels.some((c) => c.name === channel!.name)
      ) {
        await channel!.delete();
      }
    }
  }
}
