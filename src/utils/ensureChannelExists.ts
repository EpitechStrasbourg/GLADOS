import {
  Guild,
  GuildChannel,
  CategoryChannelType,
} from 'discord.js';
import Logger from '@/lib/logger';
import { formatChannelName } from '@/utils/formatConfig';

export default async (
  guild: Guild,
  channelName: string,
  channelType: CategoryChannelType,
  categoryId?: string,
): Promise<GuildChannel | null> => {
  try {
    let channel = guild.channels.cache.find(
      (ch) => formatChannelName(ch.name) === formatChannelName(channelName)
        && ch.type === channelType
        && (!categoryId || (ch.parentId === categoryId)),
    ) as GuildChannel | undefined;

    if (!channel) {
      Logger.info(`Channel ${channelName} of type ${channelType} does not exist. Creating...`);
      channel = await guild.channels.create({
        name: channelName,
        type: channelType,
        parent: categoryId ?? undefined,
      });
      Logger.info(`Channel ${channelName} created successfully.`);
    } else {
      Logger.info(`Channel ${channelName} already exists.`);
    }

    return channel;
  } catch (error) {
    Logger.error(`Error ensuring channel exists: ${error}`);
    return null;
  }
};
