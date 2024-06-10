import { PROMOTION_PREFIX } from "@/configModule/const"
import { ConfigFile, ConfigFileChannel } from "@/configModule/types"
import stringToChannelType from "@/utils/stringToChannelType"
import { CategoryChannel, ChannelType, Guild } from "discord.js"

/**
 * Generate common channels for all promotion categories
 * @param guild Guild
 * @param config ConfigFile
 * @returns Promise<void>
 */
export default async function generateCommonForPromotion(
  guild: Guild,
  config: ConfigFile
) {
  const categoryPromotions = guild.channels.cache.filter(
    (category) =>
      category &&
      category.type === ChannelType.GuildCategory &&
      category.name.includes(PROMOTION_PREFIX)
  )

  const commonChannels = config["*"] as ConfigFileChannel[]

  for (const category of categoryPromotions.values()) {
    for (const channelConfig of commonChannels) {
      const existingChannel = guild.channels.cache.find(
        (channel) =>
          channel &&
          channel.type === stringToChannelType(channelConfig.type) &&
          channel.name === channelConfig.name &&
          channel.parentId === category!.id
      )

      if (!existingChannel) {
        await guild.channels.create({
          name: channelConfig.name,
          type: stringToChannelType(channelConfig.type),
          parent: category as CategoryChannel,
        })
      }
    }
  }
}
