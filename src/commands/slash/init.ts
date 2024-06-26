import ConfigModule from '@/configModule';
import axios from 'axios';

import { SlashCommand, SlashCommandConfig, SlashCommandInteraction } from '@/types/command';
import Logger from '@/lib/logger';
import { acquireLock, isLockAcquired, releaseLock } from '@/utils/configMutex';
import { PermissionsBitField } from 'discord.js';

const config: SlashCommandConfig = {
  description: 'Init the channels and roles according to the config',
  usage: '/init',
  options: [
    {
      name: 'config_file',
      description: 'The .json config file',
      type: 'ATTACHMENT',
      required: true,
    },
  ],
};

async function processInteraction(content: string, answer: boolean, interaction: SlashCommandInteraction) {
  if (isLockAcquired()) {
    if (content.includes('...')) content = content.slice(0, -3);

    if (!answer) {
      await interaction.reply({ content });
      answer = true;
    } else {
      await interaction.editReply({ content });
    }

    content += '.';

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await processInteraction(content, answer, interaction);
  }
}

const command: SlashCommand = {
  permissions: PermissionsBitField.Flags.Administrator,
  execute: async (interaction) => {
    try {
      const answer = false;
      const content = 'A config is already being processed. Please wait...';
      const configInput = interaction.options.get('config_file');

      const file = await axios.get(configInput!.attachment!.url);

      await processInteraction(content, answer, interaction);

      acquireLock();
      const configModule = new ConfigModule(
        interaction.guild!,
        file.data,
        interaction,
      );

      if (!answer) {
        await interaction.reply({
          content: 'Config file loaded successfully',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'Config file loaded successfully',
        });
      }

      Logger.info('Processing config file...');
      await configModule.processConfig();
      Logger.info('Config file processed successfully');
      await ConfigModule.saveConfigToDatabase(file.data);
      Logger.info('Config file saved to database');
      await interaction.editReply({ content: 'Config updated successfully.' });
    } catch (err) {
      Logger.error('Error while processing config file: ', err);
      await interaction.editReply({
        content: 'Error while processing config file.',
      });
    }
    releaseLock();
  },
};

export default { command, config };
