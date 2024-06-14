import Logger from '@/lib/logger';
import { GuildMember } from 'discord.js';

import { UserModel } from '@/database/models';

export default async (member: GuildMember) => {
  try {
    // remove user from db
    Logger.debug(`${member.user.tag} has left the server.`);

    await UserModel.destroy({ where: { discordId: member.user.id } });
  } catch (error) {
    Logger.error('error', `Error removing role from member: ${error}`);
  }
};
