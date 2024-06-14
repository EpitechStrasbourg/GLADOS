import fs from 'fs';
import path from 'path';
import DiscordClient from '@/lib/client';
import Logger from '@/lib/logger';
import env from '@/env';
import ensureRoleExists from '@/utils/ensureRoleExists';
import ensureChannelExists from '@/utils/ensureChannelExists';
import { Colors, PermissionResolvable } from 'discord.js';
import stringToChannelType from '@/utils/stringToChannelType';
import findOrCreateCategory from '@/configModule/findOrCreateCategory';

export default async (client: DiscordClient) => {
  Logger.info(`Logged in as ${client.user?.tag}!`);

  // Load the configuration file
  const configPath = path.resolve(__dirname, '../../../base.config.json');
  let config: any;

  try {
    const data = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(data);
  } catch (error) {
    Logger.error(`Failed to read or parse config file: ${error}`);
    return;
  }

  const guild = client.guilds.cache.get(env.GUILD_ID);
  if (guild) {
    if (config.roles) {
      for (const roleConfig of config.roles) {
        const rolePermissions = roleConfig.permissions as PermissionResolvable[];
        await ensureRoleExists(guild, roleConfig.name, Colors.Default, rolePermissions);
      }
    } else {
      Logger.warn('No roles found in config.');
    }

    if (config.channels) {
      for (const channelConfig of config.channels) {
        const channelType = stringToChannelType(channelConfig.type);
        const category = await findOrCreateCategory(guild, channelConfig.parent);

        await category.setPosition(channelConfig.categoryPosition);
        await ensureChannelExists(guild, channelConfig.name, channelType, category.id);
      }
    } else {
      Logger.warn('No channels found in config.');
    }
  } else {
    Logger.error('Guild not found.');
  }
};
