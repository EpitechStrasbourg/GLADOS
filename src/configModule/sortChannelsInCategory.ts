import { ConfigFileChannel } from '@/configModule/types';
import {
  CategoryChannel,
  ChannelType,
  Guild,
  GuildBasedChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
} from 'discord.js';

/**
 * Sorts channels in a category based on the order in the config file.
 * @param guild The guild where the category is located.
 * @param category The category to sort.
 * @param channelsConfig The config file channels.
 * @param commonChannels The common channels.
 * @returns Promise<void>
 */
export default async function sortChannelsInCategory(
  guild: Guild,
  category: CategoryChannel,
  channelsConfig: ConfigFileChannel[],
  commonChannels: ConfigFileChannel[],
) {
  try {
    const channels = guild.channels.cache;

    const categorizedChannels: Exclude<
      GuildBasedChannel,
      PrivateThreadChannel | PublicThreadChannel<boolean>
    >[] = [];

    channels.forEach((channel) => {
      if (
        channel
        && channel.parentId === category.id
        && channel.type !== ChannelType.PrivateThread
        && channel.type !== ChannelType.PublicThread
      ) {
        categorizedChannels.push(
          channel as Exclude<
            GuildBasedChannel,
            PrivateThreadChannel | PublicThreadChannel<boolean>
          >,
        );
      }
    });

    const commonConfigChannels = categorizedChannels.filter((channel) => commonChannels.some((config) => config.name === channel.name));

    const otherConfigChannels = categorizedChannels.filter(
      (channel) => !commonChannels.some((config) => config.name === channel.name)
        && channelsConfig.some((config) => config.name === channel.name),
    );

    const remainingChannels = categorizedChannels.filter(
      (channel) => !commonChannels.some((config) => config.name === channel.name)
        && !channelsConfig.some((config) => config.name === channel.name),
    );

    const orderedCommonChannels = commonConfigChannels.sort(
      (a, b) => commonChannels.findIndex((config) => config.name === a.name)
        - commonChannels.findIndex((config) => config.name === b.name),
    );

    const orderedOtherConfigChannels = otherConfigChannels.sort(
      (a, b) => channelsConfig.findIndex((config) => config.name === a.name)
        - channelsConfig.findIndex((config) => config.name === b.name),
    );

    const sortedRemainingChannels = remainingChannels.sort((a, b) => a.name!.localeCompare(b.name!));

    const orderedChannels = [
      ...orderedCommonChannels,
      ...orderedOtherConfigChannels,
      ...sortedRemainingChannels,
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const [index, channel] of orderedChannels.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await channel.setPosition(index, {
        relative: false,
        reason: 'Sort channels',
      });
    }
  } catch (err) {
    throw new Error(`Failed to sort channels for ${category.name}: ${err}`);
  }
}
