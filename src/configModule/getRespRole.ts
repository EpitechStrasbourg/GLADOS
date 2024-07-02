import Logger from '@/lib/logger';
import { Guild } from 'discord.js';

export default async function getRespRole(guild: Guild, key: string) {
  try {
    const rolename = key.replace('_', '');
    const roles = await guild.roles.fetch();
    const roleResp = roles.filter((role) => role.name.includes(`Resp ${rolename}`));
    return roleResp.map((role) => role);
  } catch (error) {
    Logger.error(`Error getting role for ${key}: ${error}`);
    return [];
  }
}
