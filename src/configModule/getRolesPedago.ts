import Logger from '@/lib/logger';
import { Guild, Role } from 'discord.js';

export default async function getRolesPedago(guild: Guild) {
  try {
    const roles = await guild.roles.fetch();
    const rolesPedago: Role[] = [];
    const rolePédago = roles.find((role) => role.name === 'Pédago');
    if (rolePédago) rolesPedago.push(rolePédago);
    const roleDPR = roles.find((role) => role.name === 'DPR');
    if (roleDPR) rolesPedago.push(roleDPR);
    return rolesPedago;
  } catch (error) {
    Logger.error(`Error getting role for pedago: ${error}`);
    return [];
  }
}
