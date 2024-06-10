import {
  GLADOS_CATEGORY_NAME,
  GLADOS_CHANNEL_CONFIG_NAME,
} from '@/configModule/const';
import { ConfigFile } from '@/configModule/types';
import {
  CategoryChannel,
  ChannelType,
  Guild,
  GuildTextBasedChannel,
} from 'discord.js';

import Logger from '@/lib/logger';

/**
 * Update the config channel with the new config file
 * @param guild The guild to update the config channel in
 * @param configFile The new config file
 * @returns Promise<void>
 */

export default async function updateConfigChannel(
  guild: Guild,
  configFile: ConfigFile,
) {
  try {
    let configCategory = guild.channels.cache.find(
      (channel) => channel
        && channel.type === ChannelType.GuildCategory
        && channel.name === GLADOS_CATEGORY_NAME,
    ) as CategoryChannel;
    if (!configCategory) {
      configCategory = await guild.channels.create({
        name: GLADOS_CATEGORY_NAME,
        type: ChannelType.GuildCategory,
      });
    }

    let configChannel = guild.channels.cache.find(
      (channel) => channel
        && channel.type === ChannelType.GuildText
        && channel.name === GLADOS_CHANNEL_CONFIG_NAME
        && channel.parentId === configCategory.id,
    );

    if (!configChannel) {
      configChannel = await guild.channels.create({
        name: GLADOS_CHANNEL_CONFIG_NAME,
        type: ChannelType.GuildText,
        parent: configCategory,
      });
    }

    const messages = await (
      configChannel as GuildTextBasedChannel
    ).messages.fetch();

    if (messages.size > 0) {
      const message = messages.first();
      await message?.edit({
        content: `\`\`\`json\n${JSON.stringify(configFile, null, 2)}\n\`\`\``,
      });
    } else {
      await (configChannel as GuildTextBasedChannel).send({
        content: `\`\`\`json\n${JSON.stringify(configFile, null, 2)}\n\`\`\``,
      });
    }
    let highestPosition = 0;
    guild.channels.cache.forEach((channel) => {
      if (channel.type === ChannelType.GuildCategory) {
        if (channel.rawPosition > highestPosition) {
          highestPosition = channel.rawPosition;
        }
      }
    });
    await configCategory.setPosition(highestPosition + 1);
  } catch (err) {
    Logger.debug(err);
  }
}
