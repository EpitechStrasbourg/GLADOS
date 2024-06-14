import { CategoryChannel, ChannelType, Guild } from 'discord.js';

/**
 * Find or create category
 * @param guild Guild
 * @param categoryName The name of the category
 * @returns Promise<CategoryChannel>
 */
export default async function findOrCreateCategory(
  guild: Guild,
  categoryName: string,
) {
  try {
    const existingChannel = guild.channels.cache.find(
      (channel) => channel
        && channel.name
          === categoryName,
    ) as CategoryChannel;

    if (existingChannel) return existingChannel;

    return await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
    });
  } catch (err) {
    throw new Error(`Failed to initialize category for ${categoryName}`);
  }
}
