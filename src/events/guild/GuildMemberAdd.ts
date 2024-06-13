import Logger from '@/lib/logger';
import { GuildMember } from 'discord.js';

export const roleName = 'Extern';

export default async (member: GuildMember) => {
  try {
    Logger.debug('debug', `Fetching role with ID ${roleName} from guild ${member.guild.id}`);
    const role = member.guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      Logger.error('error', `Role with name ${roleName} not found in guild ${member.guild.id}`);
      return;
    }
    await member.roles.add(role);
    Logger.debug('info', `Assigned role ${role.name} to new member ${member.user.tag} (${member.id})`);
  } catch (error) {
    Logger.error('error', `Error assigning role to new member: ${error}`);
  }
};
