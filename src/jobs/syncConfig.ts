import ConfigModule from '@/configModule';
import DiscordClient from '@/lib/client';
import env from '@/env';
import Logger from '@/lib/logger';
import { acquireLock, isLockAcquired, releaseLock } from '@/utils/configMutex';

export default async function syncConfig(client: DiscordClient): Promise<void> {
  while (isLockAcquired()) {
    Logger.info('A config is already being processed. Please wait...');

    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  acquireLock();
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
        Logger.info('Config synced successfully');
      }
    }
  } catch (err) {
    Logger.error('Error while syncing config: ', err);
  }
  releaseLock();
}
