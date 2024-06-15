import {
  ColorResolvable, Colors, Guild, PermissionsBitField, Role,
} from 'discord.js';
import Logger from '@/lib/logger';
import permissionFlagMap from '@/utils/permissionFlagMap';

export default async (
  guild: Guild,
  roleName: string,
  roleColor: ColorResolvable = Colors.Default,
  permissions: string[] = [],
  displaySeparately: boolean = false,
): Promise<Role | null> => {
  try {
    let role = guild.roles.cache.find((r) => r.name === roleName);
    const resolvedPermissions = new PermissionsBitField(
      permissions.map((perm) => permissionFlagMap[perm]),
    );

    if (!role) {
      Logger.info(`Role ${roleName} does not exist. Creating...`);
      role = await guild.roles.create({
        name: roleName,
        color: roleColor,
        permissions: resolvedPermissions,
        hoist: displaySeparately,
      });
      Logger.info(`Role ${roleName} created successfully.`);
    } else {
      Logger.info(`Role ${roleName} already exists.`);
      if (!role.permissions.equals(resolvedPermissions)) {
        await role.setPermissions(resolvedPermissions);
        await role.setHoist(displaySeparately);
        Logger.info(`Updated permissions for role ${roleName}: ${permissions}.`);
      }
    }
    return role;
  } catch (error) {
    Logger.error(`Error ensuring role exists: ${error}`);
    return null;
  }
};
