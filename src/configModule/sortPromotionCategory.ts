import { PROMOTION_PREFIX } from '@/configModule/const';
import { CategoryChannel, ChannelType, Guild } from 'discord.js';

/**
 * Sort promotion categories starting with PROMOTION_PREFIX
 * @param guild Guild
 * @returns Promise<void>
 */
export default async function sortPromotionCategory(guild: Guild) {
  const categories = guild.channels.cache.filter(
    (channel) => channel
      && channel.type === ChannelType.GuildCategory
      && channel.name.includes(PROMOTION_PREFIX),
  );

  const sortChannel = Array.from(categories.values()) as CategoryChannel[];

  await Promise.allSettled(sortChannel.map(async (channel, i) => {
    if (channel.rawPosition === i) return;
    await channel.setPosition(i);
  }));
}
