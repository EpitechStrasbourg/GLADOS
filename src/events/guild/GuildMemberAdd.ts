import { Logger } from '@/lib/logger';
import { GuildMember } from 'discord.js';

export const roleName = 'Extern';

export default async (member: GuildMember) => {
  try {
    // Define the role ID you want to assign

    // Fetch the role from the guild
    Logger.debug('debug', `Fetching role with ID ${roleName} from guild ${member.guild.id}`);
    const role = member.guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      Logger.error('error', `Role with name ${roleName} not found in guild ${member.guild.id}`);
      return;
    }
    // Add the role to the member
    await member.roles.add(role);
    Logger.debug('info', `Assigned role ${role.name} to new member ${member.user.tag} (${member.id})`);
  } catch (error) {
    Logger.error('error', `Error assigning role to new member: ${error}`);
  }
};
