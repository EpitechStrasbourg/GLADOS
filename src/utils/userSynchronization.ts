import isAdmin from '@/utils/isAdmin';
import {
  capitalizeFirstCharacter,
  removeDigitsFromEnd,
  sliceAtChar,
} from '@/utils/nameUtils';
import { Guild } from 'discord.js';

import { City, UserSauronInfo } from '@/types/userSauronInfo';
import Logger from '@/lib/logger';

const PGE_cycles = ['bachelor', 'master'];
const PGE_suffix = 'PGE ';
const studentRoleName = 'Étudiant';

export async function fetchUserData(
  login: string,
): Promise<UserSauronInfo | null> {
  try {
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${process.env.SAURON_TOKEN}`,
      },
    };
    const response = await fetch(
      `https://api.sauron.epitest.eu/api/users/${login}/infos`,
      config,
    );

    const data = await response.json();
    if (!response.ok) {
      Logger.error(
        'error',
        `Fetch failed for user ${login}. Error: ${response.status} ${data.error}`,
      );
      return null;
    }
    return data;
  } catch (error) {
    Logger.error('error', `Error fetching student data: ${error}`);
    return null;
  }
}

export async function syncRolesAndRename(
  guild: Guild,
  memberId: string,
  user: UserSauronInfo,
): Promise<void> {
  try {
    const member = await guild.members.fetch(memberId);
    if (!member) {
      Logger.error('error', `Member not found: ${memberId}`);
      return;
    }

    const userRoles: string[] = [];
    const roles = await guild.roles.fetch();
    if (user.roles.includes('student') && user.promo) {
      if (PGE_cycles.includes(user.promo.cursus.code) && roles) {
        const roleName = PGE_suffix + user.promo.promotion_year.toString();
        const guildRole = roles.find((r) => r.name === roleName);
        const schoolRole = roles.find((r) => r.name === studentRoleName);
        if (!guildRole || !schoolRole) {
          Logger.error('error', `Role not found: ${roleName}`);
          return;
        }
        userRoles.push(guildRole.id, schoolRole.id);
      }
    }

    user.cities.forEach((city: City) => {
      const tpmRole = roles.find((r) => r.name === city.name);
      if (!tpmRole) {
        Logger.error('error', `Role not found: ${city.name}`);
        return;
      }
      userRoles.push(tpmRole.id);
    });

    await member.roles.set(userRoles);

    if (isAdmin(user.roles)) return;

    const loginBits = sliceAtChar(user.login, '@').split('.');
    if (loginBits.length >= 2) {
      const firstName = capitalizeFirstCharacter(
        removeDigitsFromEnd(loginBits[0]),
      );
      const lastName = loginBits[1].toUpperCase();
      await member.setNickname(`${firstName} ${lastName}`);
    }
    Logger.info('info', `Member updated: ${memberId}`);
  } catch (error) {
    Logger.error('error', `Error syncing roles and renaming: ${error}`);
  }
}
