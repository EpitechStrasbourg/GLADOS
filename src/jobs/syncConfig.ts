import ConfigModule from '@/configModule';
import DiscordClient from '@/lib/client';
import { env } from '@/env';
import Logger from '@/lib/logger';

export default async function syncConfig(client: DiscordClient): Promise<void> {
  try {
    Logger.info('Syncing config...');
    const config = await ConfigModule.getConfigFromDatabase();
    if (config) {
      const guilds = await client.guilds.fetch();
      const guildConfig = guilds.find((c) => c.id === env.GUILD_ID);
      if (guildConfig) {
        const guild = await guildConfig.fetch();
        const module = new ConfigModule(guild, config, null);
        await module.processConfig();
        await ConfigModule.updateConfigChannel(guild, config);
        Logger.info('Config synced successfully');
      }
    }
  } catch (err) {
    Logger.error('Error while syncing config: ', err);
  }
}
