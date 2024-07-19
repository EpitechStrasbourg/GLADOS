import { ConfigFileChannel } from '@/configModule/types';
import { formatChannelName } from '@/utils/formatConfig';
import stringToChannelType from '@/utils/stringToChannelType';
import {
  CategoryChannel, Guild, OverwriteResolvable, Role,
} from 'discord.js';

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
  role: Role,
  rolesResp: Role[],
) {
  try {
    await Promise.allSettled(channelsConfig.map(async (channelConfig) => {
      const existingChannel = guild.channels.cache.find(
        (channel) => channel
          && channel.type === stringToChannelType(channelConfig.type)
          && formatChannelName(channel.name) === channelConfig.name
          && channel.parentId === category.id,
      );
      rolesResp.push(role);
      const permissionOverwrites: OverwriteResolvable[] = [
        {
          deny: ['ViewChannel'],
          id: guild.id,
        },
      ];
      rolesResp.forEach((r) => {
        permissionOverwrites.push({
          allow: ['ViewChannel'],
          id: r.id,
        });
      });
      if (!existingChannel) {
        await guild.channels.create({
          name: channelConfig.name,
          type: stringToChannelType(channelConfig.type),
          parent: category,
          permissionOverwrites,
        });
      } else {
        await existingChannel.edit({
          permissionOverwrites,
        });
      }
    }));
  } catch (err) {
    throw new Error(`Failed to initialize channels for ${category.name}`);
  }
}
