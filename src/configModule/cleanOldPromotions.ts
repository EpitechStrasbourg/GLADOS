import { PROMOTION_PREFIX } from '@/configModule/const';
import sortChannelsInCategory from '@/configModule/sortChannelsInCategory';
import { ConfigFile, ConfigFileChannel } from '@/configModule/types';
import { CategoryChannel, ChannelType, Guild } from 'discord.js';

/**
 * Clean old promotions that are not in the promotion config
 * @param guild Guild
 * @param foundCategories CategoryChannel[]
 * @param config ConfigFile
 * @returns Promise<void>
 */
export default async function cleanOldPromotions(
  guild: Guild,
  foundCategories: CategoryChannel[],
  config: ConfigFile,
) {
  const categoryPromotions = guild.channels.cache.filter(
    (category) => category
      && category.type === ChannelType.GuildCategory
      && category.name.includes(PROMOTION_PREFIX),
  );

  for (const category of categoryPromotions.values()) {
    if (!foundCategories.some((c) => c.id === category!.id)) {
      const commonChannels = config['*'] as ConfigFileChannel[];

      for (const channel of guild.channels.cache.values()) {
        if (channel!.parentId === category!.id) {
          if (!commonChannels.some((c) => c.name === channel!.name)) {
            await channel!.delete();
          }
        }
      }
      sortChannelsInCategory(guild, category as CategoryChannel, [], []);
    }
  }
}
