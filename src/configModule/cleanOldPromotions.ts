import { PROMOTION_PREFIX } from '@/configModule/const';
import sortChannelsInCategory from '@/configModule/sortChannelsInCategory';
import { ConfigFile, ConfigFileChannel } from '@/configModule/types';
import { CategoryChannel, ChannelType, Guild } from 'discord.js';

/**
 * Fetch all categories that begins with PROMOTION_PREFIX
 * and clean the channels not present in ["*"] config file
 * if these promotions are not in the config file
 *
 * Example: tech 5+ promotions.
 *
 * @param guild The guild to clean the promotions
 * @param foundCategories The categories promotions found in the config file
 * @param config The config file
 */

export default async function cleanOldPromotions(
  guild: Guild,
  foundCategories: CategoryChannel[],
  config: ConfigFile,
) {
  const commonChannels = config['*'] as ConfigFileChannel[];
  const categoryPromotions = guild.channels.cache.filter(
    (category) => category
      && category.type === ChannelType.GuildCategory
      && category.name.includes(PROMOTION_PREFIX),
  );

  await Promise.allSettled(categoryPromotions.map(async (category) => {
    if (!foundCategories.some((c) => c.id === category!.id)) {
      const channelsToDelete = guild.channels.cache.filter((channel) => channel.parentId === category!.id && !commonChannels.some((c) => c.name === channel!.name));

      await Promise.allSettled(channelsToDelete.map(async (channel) => channel!.delete()));

      await sortChannelsInCategory(guild, category as CategoryChannel, [], []);
    }
  }));
}
