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

  await Promise.allSettled(categoryPromotions.map(async (category) => {
    if (!foundCategories.some((c) => c.id === category!.id)) {
      const commonChannels = config['*'] as ConfigFileChannel[];

      await Promise.allSettled(guild.channels.cache.map(async (channel) => {
        if (channel!.parentId === category!.id) {
          if (!commonChannels.some((c) => c.name === channel!.name)) {
            await channel!.delete();
          }
        }
      }));

      await sortChannelsInCategory(guild, category as CategoryChannel, [], []);
    }
  }));
}
