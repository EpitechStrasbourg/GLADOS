import { Guild } from 'discord.js';

/**
 * Finds a role by name in a guild, or creates it if it doesn't exist.
 * @param guild - The guild to find or create the role in.
 * @param roleName - The name of the role to find or create.
 * @returns Promise<Role>
 */
export default async function findOrCreateRole(guild: Guild, roleName: string) {
  try {
    let role = guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      role = await guild.roles.create({
        name: roleName,
      });
    }
    return role;
  } catch (err) {
    throw new Error(`Error in findOrCreateRole: ${err}`);
  }
}
