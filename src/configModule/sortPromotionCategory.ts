import { PROMOTION_PREFIX } from "@/configModule/const"
import { CategoryChannel, ChannelType, Guild } from "discord.js"

/**
 * Sort promotion categories starting with PROMOTION_PREFIX
 * @param guild Guild
 * @returns Promise<void>
 */
export default async function sortPromotionCategory(guild: Guild) {
  const categories = guild.channels.cache.filter(
    (channel) =>
      channel &&
      channel.type === ChannelType.GuildCategory &&
      channel.name.includes(PROMOTION_PREFIX)
  )

  const sortChannel = [] as CategoryChannel[]

  categories.forEach((category) => {
    sortChannel.push(category as CategoryChannel)
  })

  sortChannel.sort((a, b) => {
    return b.name.localeCompare(a.name)
  })
  for (let i = 0; i < sortChannel.length; i++) {
    if (sortChannel[i].rawPosition === i) continue
    await sortChannel[i].setPosition(i)
  }
}
