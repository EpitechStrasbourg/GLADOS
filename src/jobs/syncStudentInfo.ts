import DiscordClient from '@/lib/client';
import User from '@/database/models/model.user';
import {
  fetchUserData, fetchUserRoadblocks, syncRolesAndRename, syncRolesModules,
} from '@/utils/userSynchronization';
import env from '@/env';

export default async function syncStudentInfo(client: DiscordClient): Promise<void> {
  await client.guilds.fetch();
  try {
    const users = await User.findAll({ where: { verified: true } });
    await Promise.allSettled(users.map(async (user) => {
      const login = user.getDataValue('login');
      const userData = await fetchUserData(login);
      if (!userData) {
        return;
      }
      await syncRolesAndRename(
                client.guilds.cache.get(env.GUILD_ID)!,
                user.getDataValue('discordId'),
                userData,
      );
      const roadblockData = await fetchUserRoadblocks(login);
      if (!roadblockData) {
        return;
      }
      await syncRolesModules(client.guilds.cache.get(env.GUILD_ID)!, user.getDataValue('discordId'), roadblockData);
    }));
  } catch (err) {
    console.log(err);
  }
}
