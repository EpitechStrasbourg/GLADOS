import {
  ColorResolvable, Colors, Guild, PermissionResolvable, Role,
} from 'discord.js';
import Logger from '@/lib/logger';

export default async (
  guild: Guild,
  roleName: string,
  roleColor: ColorResolvable = Colors.Default,
  permissions: PermissionResolvable[] = [],
): Promise<Role | null> => {
  try {
    let role = guild.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      Logger.info(`Role ${roleName} does not exist. Creating...`);
      role = await guild.roles.create({
        name: roleName,
        color: roleColor,
        permissions,
      });
      Logger.info(`Role ${roleName} created successfully.`);
    } else {
      Logger.info(`Role ${roleName} already exists.`);
    }
    return role;
  } catch (error) {
    Logger.error(`Error ensuring role exists: ${error}`);
    return null;
  }
};
