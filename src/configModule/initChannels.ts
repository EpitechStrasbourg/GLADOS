import { ConfigFileChannel } from "@/configModule/types"
import stringToChannelType from "@/utils/stringToChannelType"
import { CategoryChannel, Guild, Role } from "discord.js"

/**
 * Initialize channels for a category
 * @param guild - The guild to initialize the channels in.
 * @param category - The category to initialize the channels in.
 * @param channelsConfig - The channels to initialize.
 * @param role - The role to give access to the channels.
 * @returns Promise<void>
 */
export default async function initChannels(
  guild: Guild,
  category: CategoryChannel,
  channelsConfig: ConfigFileChannel[],
  role: Role
) {
  try {
    for (const channelConfig of channelsConfig) {
      const existingChannel = guild.channels.cache.find(
        (channel) =>
          channel &&
          channel.type === stringToChannelType(channelConfig.type) &&
          channel.name === channelConfig.name &&
          channel.parentId === category.id
      )

      if (!existingChannel) {
        await guild.channels.create({
          name: channelConfig.name,
          type: stringToChannelType(channelConfig.type),
          parent: category,
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
      }
    }
  } catch (err) {
    throw new Error(`Failed to initialize channels for ${category.name}`)
  }
}
