import { PROMOTION_ENDING, PROMOTION_PREFIX } from "@/configModule/const"
import findOrCreateRole from "@/configModule/findOrCreateRole"
import { CategoryChannel, ChannelType, Guild } from "discord.js"

/**
 * Find or create category for promotion
 * @param guild Guild
 * @param categoryName The name of the category
 * @returns Promise<CategoryChannel>
 */
export default async function findOrCreateCategory(
  guild: Guild,
  categoryName: string
) {
  try {
    const existingChannel = guild.channels.cache.find(
      (channel) =>
        channel &&
        channel.name ===
          `${PROMOTION_PREFIX} ${categoryName}${PROMOTION_ENDING}`
    ) as CategoryChannel

    if (existingChannel) return existingChannel

    const role = await findOrCreateRole(guild, categoryName)

    return await guild.channels.create({
      name: `${PROMOTION_PREFIX} ${categoryName}${PROMOTION_ENDING}`,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          deny: ["ViewChannel"],
          id: guild.id,
        },
        {
          allow: ["ViewChannel"],
          id: role.id,
        },
      ],
    })
  } catch (err) {
    throw new Error(`Failed to initialize category for ${categoryName}`)
  }
}
