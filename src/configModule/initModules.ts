import findOrCreateRole from '@/configModule/findOrCreateRole';
import { ConfigFileModule } from '@/configModule/types';
import {
  CategoryChannel, ChannelType, Guild, OverwriteResolvable,
} from 'discord.js';

/**
 * Initialize modules for a promotion
 * @param category The category to initialize modules for
 * @param modules The modules to initialize
 * @param promotionName The name of the promotion
 * @param guild The guild to initialize the modules in
 * @returns Promise<void>
 */
export default async function initModules(
  category: CategoryChannel,
  modules: ConfigFileModule[],
  promotionName: string,
  guild: Guild,
  rolesResp: Role[],
) {
  try {
    await Promise.allSettled(modules.map(async (module) => {
      const role = await findOrCreateRole(
        guild,
        `${promotionName.split('_').join('')} ${module.name.toUpperCase()}`,
      );
      const roleResp = await findOrCreateRole(
        guild,
        `Resp ${promotionName.split('_').join('')} ${module.name.toUpperCase()}`,
      );
      const existingChannel = guild.channels.cache.find(
        (channel) => channel
          && channel.type === ChannelType.GuildForum
          && channel.name === module.name
          && channel.parentId === category.id,
      );
      rolesResp.push(roleResp);
      rolesResp.push(role);
      const permissionOverwrites: OverwriteResolvable[] = [
        {
          deny: ['ViewChannel'],
          id: guild.id,
        },
        {
          allow: ['ViewChannel'],
          id: role.id,
        },
        {
          allow: ['ViewChannel'],
          id: roleResp.id,
        },
      ];
      rolesResp.forEach((r) => {
        permissionOverwrites.push({
          allow: ['ViewChannel'],
          id: r.id,
        });
      });
      if (!existingChannel) {
        await guild.channels.create({
          name: module.name,
          type: ChannelType.GuildForum,
          parent: category,
          permissionOverwrites,
        });
      } else {
        await existingChannel.edit({
          permissionOverwrites,
        });
      }
    }));
  } catch (err) {
    throw new Error(`Failed to initialize modules for ${category.name}`);
  }
}
