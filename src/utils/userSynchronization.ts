import isAdmin from '@/utils/isAdmin';
import {
  capitalizeFirstCharacter,
  removeDigitsFromEnd,
  sliceAtChar,
} from '@/utils/nameUtils';
import { Guild, Role } from 'discord.js';

import { City, UserSauronInfo } from '@/types/userSauronInfo';
import Logger from '@/lib/logger';
import { Roadblocks, RoadblocksResult } from '@/types/userSauronRoadblock';
import ConfigModule from '@/configModule';
import { ConfigFilePromotion } from '@/configModule/types';
import getPromotionFromTekYear from './getPromotionFromTekYear';

const PGE_cycles = ['bachelor', 'master'];
const PGE_suffix = 'PGE ';
const studentRoleName = 'Étudiant';

export async function fetchUserRoadblocks(login: string): Promise< RoadblocksResult | null> {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${process.env.SAURON_TOKEN}`,
    },
  };
  const response = await fetch(
    `https://api.sauron.epitest.eu/api/students/roadblocks?login=${login}&active_only=true&projected=false&limit=1&offset=0`,
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
  if (data.results.length === 0) {
    Logger.error('error', `No results found for user ${login}`);
    return null;
  }
  return data.results[0] as RoadblocksResult;
}

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

function extractUnitFromRoadblock(roadblocks: Roadblocks, key: 'softskills' | 'technical_foundation' | 'technical_supplement' | 'professional_writings') {
  if (roadblocks[key].units) {
    return roadblocks[key].units!.map((unit) => unit.unit.toUpperCase());
  }
  return [];
}

export async function syncRolesModules(guild: Guild, memberId: string, user: RoadblocksResult): Promise<void> {
  try {
    const member = await guild.members.fetch(memberId);
    const roles = await guild.roles.fetch();
    if (!member) {
      Logger.error('error', `Member not found: ${memberId}`);
      return;
    }
    const userRoles: Role[] = [];
    const config = await ConfigModule.getConfigFromDatabase();
    if (!config) {
      Logger.error('error', 'Config not found');
      return;
    }
    const promotionYear = getPromotionFromTekYear(user.student.promo.promotion_year);
    const roleName = PGE_suffix + promotionYear;
    const configName = roleName.replaceAll(' ', '_');
    const configModules = config[configName] as ConfigFilePromotion;
    if (!configModules) {
      Logger.error('error', `Config not found: ${configName}`);
      return;
    }
    await Promise.allSettled(configModules.modules.map(async (module) => {
      await Promise.allSettled(module.sub_modules.map(async (sub) => {
        await Promise.allSettled(Object.keys(user.roadblocks).map(async (roadblock) => {
          if (roadblock === 'softskills' || roadblock === 'technical_foundation' || roadblock === 'technical_supplement' || roadblock === 'professional_writings') {
            const units = extractUnitFromRoadblock(user.roadblocks, roadblock as 'softskills' | 'technical_foundation' | 'technical_supplement' | 'professional_writings');
            if (units.includes(sub.toUpperCase())) {
              const guildRole = roles.find((r) => r.name === `${roleName.replace(' ', '')} ${module.name.toUpperCase()}`);
              if (!guildRole) {
                Logger.error('error', `Role not found: ${module.name}`);
                return;
              }
              userRoles.push(guildRole);
            }
          }
        }));
      }));
    }));
    await Promise.allSettled(userRoles.map(async (role) => {
      await member.roles.add(role);
    }));
  } catch (error) {
    Logger.error('error', `Error syncing module roles: ${error}`);
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

    if (user.roles.includes('pedago')) {
      const guildRole = roles.find((r) => r.name === 'Pédago');
      if (!guildRole) {
        Logger.error('error', 'Role not found: Pédago');
        return;
      }
      userRoles.push(guildRole.id);
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
      const firstName = capitalizeFirstCharacter(removeDigitsFromEnd(loginBits[0]));
      const lastName = loginBits[1].toUpperCase();
      await member.setNickname(`${firstName} ${lastName}`);
    }
    Logger.info('info', `Member updated: ${memberId}`);
  } catch (error) {
    Logger.error('error', `Error syncing roles and renaming: ${error}`);
  }
}
