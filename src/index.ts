import connectToDatabase, { sequelize } from '@/database';
import handleEvents from '@/handlers/eventHandler';
import JobController from '@/jobs';
import loadSlashCommands from '@/loaders/slashCommands';
import {
  GatewayIntentBits, IntentsBitField, REST, Routes,
} from 'discord.js';
import syncConfig from '@/jobs/syncConfig';
import DiscordClient from '@/lib/client';
import Logger from '@/lib/logger';
import syncStudentInfo from '@/jobs/syncStudentInfo';

import env from './env';
// import getPromotionFromTekYear from './utils/getPromotionFromTekYear';
// import getTekYearFromPromotion from './utils/getTekYearFromPromotion';

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

    /*
    console.log(getPromotionFromTekYear(2024));
    console.log(getPromotionFromTekYear(2025));
    console.log(getPromotionFromTekYear(2026));
    console.log(getPromotionFromTekYear(2027));
    console.log(getPromotionFromTekYear(2028));
    console.log(getTekYearFromPromotion(5));
    console.log(getTekYearFromPromotion(4));
    console.log(getTekYearFromPromotion(3));
    console.log(getTekYearFromPromotion(2));
    console.log(getTekYearFromPromotion(1));
    */
    const res = (await rest.put(
      Routes.applicationCommands(env.DISCORD_APP_ID),
      {
        body: slashCommands,
      },
    )) as DiscordResponse;

    client.slashConfigs = slashConfigs;

    Logger.debug(`Successfully reloaded ${res.length} (/) commands.`);
    await client.login(env.DISCORD_TOKEN);
    await connectToDatabase(sequelize);
    const jobController = new JobController();
    jobController.create(() => {
      syncConfig(client);
    }, '* * * * *');
    jobController.create(() => {
      syncStudentInfo(client);
    }, '* * * * *');
  } catch (error) {
    Logger.error(`Error refreshing application (/) commands: \n\t${error}`);
  }
})();

// Handle application events
handleEvents();
