import connectToDatabase, { sequelize } from '@/database';
import handleEvents from '@/handlers/eventHandler';
import JobController from '@/jobs';
import loadSlashCommands from '@/loaders/slashCommands';
import {
  GatewayIntentBits, IntentsBitField, REST, Routes,
} from 'discord.js';
import DiscordClient from '@/lib/client';
import Logger from '@/lib/logger';

import syncStudentInfo from '@/jobs/syncStudentInfo';
import syncConfig from '@/jobs/syncConfig';
import env from '@/env';

interface DiscordResponse {
  length: number
}

const client = DiscordClient.getInstance({
  intents: [
    GatewayIntentBits.Guilds,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMembers,
  ],
});

// Refresh application slash commands
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
(async () => {
  try {
    Logger.debug('Started refreshing application (/) commands.');

    const { slashCommands, slashConfigs } = await loadSlashCommands();
    const res = (await rest.put(
      Routes.applicationCommands(env.DISCORD_APP_ID),
      {
        body: slashCommands,
      },
    )) as DiscordResponse;

    client.slashConfigs = slashConfigs;

    Logger.debug(`Successfully reloaded ${res.length} (/) commands.`);

    await connectToDatabase(sequelize);
    await client.login(env.DISCORD_TOKEN);
    const jobController = new JobController();
    jobController.create(() => {
      syncConfig(client);
    }, '0 * * * *');
    jobController.create(() => {
      syncStudentInfo(client);
    }, '0 * * * *');
  } catch (error) {
    Logger.error(`Error launching application: \n\t${error}`);
  }
})();

// Handle application events
handleEvents();
