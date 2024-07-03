import isAdmin from '@/utils/isAdmin';
import {
  capitalizeFirstCharacter,
  removeDigitsFromEnd,
  sliceAtChar,
} from '@/utils/nameUtils';
import { Guild, GuildMember, Role } from 'discord.js';

import { City, UserSauronInfo } from '@/types/userSauronInfo';
import Logger from '@/lib/logger';
import { SauronGradesRequest } from '@/types/userSauronGrade';
import ConfigModule from '@/configModule';
import { ConfigFilePromotion } from '@/configModule/types';
import { UserSauronUnitsResponsible } from '@/types/userSauronUnitsResponsible';
import formatModulesYear from './formatModulesYear';
import getPromotionFromTekYear from './getPromotionFromTekYear';
import ensureRoleExists from './ensureRoleExists';

const PGE_cycles = ['bachelor', 'master'];
const PGE_suffix = 'PGE ';
const studentRoleName = 'Étudiant';

export async function fetchUserGrades(login: string): Promise< SauronGradesRequest | null> {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${process.env.SAURON_TOKEN}`,
    },
  };
  const response = await fetch(
    `https://api.sauron.epitest.eu/api/students/grades?login=${login}`,
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
  return data as SauronGradesRequest;
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

export async function fetchUnitResponsible(
  login: string,
): Promise<UserSauronUnitsResponsible | null> {
  try {
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${process.env.SAURON_TOKEN}`,
      },
    };
    const response = await fetch(
      `https://api.sauron.epitest.eu/api/responsibles/${login}/modules`,
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

async function fetchMember(guild: Guild, memberId: string): Promise<GuildMember | null> {
  try {
    return await guild.members.fetch(memberId);
  } catch {
    Logger.error('Member not found', { memberId });
    return null;
  }
}

async function fetchRoles(guild: Guild): Promise<Role[]> {
  return (await guild.roles.fetch()).map((role) => role);
}

async function fetchConfig() {
  const config = await ConfigModule.getConfigFromDatabase();
  if (!config) Logger.error('Config not found');
  return config;
}

async function addRolesToMember(member: GuildMember, roles: Role[]): Promise<void> {
  try {
    await Promise.all(roles.map((role) => member.roles.add(role)));
  } catch (error) {
    Logger.error('Error adding roles to member', { error });
  }
}

async function getUserRoles(
  grades: SauronGradesRequest,
  configModules: ConfigFilePromotion,
  roles: Role[],
  roleName: string,
): Promise<Role[]> {
  const userRoles: Role[] = [];
  configModules.modules.forEach((module) => {
    module.sub_modules.forEach((sub) => {
      grades.results
        .filter((grade) => grade.instance.module.code_module === sub)
        .forEach((_) => {
          const roleNameFormatted = `${roleName.replace('_', '')} ${module.name.toUpperCase()}`;
          const guildRole = roles.find((r) => r.name === roleNameFormatted);

          if (guildRole) {
            userRoles.push(guildRole);
          } else {
            Logger.error('Role not found', { moduleName: module.name });
          }
        });
    });
  });
  return userRoles;
}

export async function syncRolesModules(guild: Guild, memberId: string, grades: SauronGradesRequest, user: UserSauronInfo): Promise<void> {
  try {
    const member = await fetchMember(guild, memberId);
    if (!member) return;

    const roles = await fetchRoles(guild);
    const config = await fetchConfig();
    if (!config || !user.promo) return;

    const promotionYear = getPromotionFromTekYear(user.promo.promotion_year);
    const roleName = `${PGE_suffix}${promotionYear}`.replace(' ', '_');
    const configModules = config[roleName] as ConfigFilePromotion;
    if (!configModules) {
      Logger.error('Config not found', { configName: roleName });
      return;
    }

    const userRoles = await getUserRoles(grades, configModules, roles, roleName);
    await addRolesToMember(member, userRoles);
  } catch (error) {
    Logger.error('Error syncing module roles', error);
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

    if (user.roles.includes('dpr')) {
      const guildRole = roles.find((r) => r.name === 'DPR');
      if (!guildRole) {
        Logger.error('error', 'Role not found: DPR');
        return;
      }
      userRoles.push(guildRole.id);
    }

    if (user.roles.includes('units_responsible')) {
      const guildRole = roles.find((r) => r.name === 'Responsable de module');
      if (!guildRole) {
        Logger.error('error', 'Role not found: Responsable de module');
        return;
      }
      userRoles.push(guildRole.id);
      const unitResponsible = await fetchUnitResponsible(user.login);
      if (unitResponsible) {
        await Promise.allSettled(unitResponsible.units.map(async (unit) => {
          const unitName = formatModulesYear(unit);
          const unitRole = await ensureRoleExists(guild, `Resp ${unitName}`);
          if (!unitRole) {
            Logger.error('error', `Role not found: Resp ${unitName}`);
          } else {
            Logger.debug('unit role', unitRole);
            if (userRoles.includes(unitRole.id)) return;
            userRoles.push(unitRole.id);
          }
        }));
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
      const firstName = capitalizeFirstCharacter(removeDigitsFromEnd(loginBits[0]));
      const lastName = loginBits[1].toUpperCase();
      await member.setNickname(`${firstName} ${lastName}`);
    }
    Logger.info('info', `Member updated: ${memberId}`);
  } catch (error) {
    Logger.error('error', `Error syncing roles and renaming: ${error}`);
  }
}
