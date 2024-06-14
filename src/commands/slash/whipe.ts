import Logger from '@/lib/logger';
import { SlashCommand, SlashCommandConfig } from '@/types/command';
import { PermissionsBitField } from 'discord.js';

const config: SlashCommandConfig = {
  description: 'Delete every channels and roles created',
  usage: '/whipe',
  options: [],
};

const command: SlashCommand = {
  permissions: PermissionsBitField.Flags.Administrator,
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('Whiping all channels and roles...');
      const roles = await interaction.guild!.roles.fetch(undefined, {
        force: true,
      });
      roles.forEach(async (role) => {
        try {
          await role.delete();
        } catch (err) {
          Logger.error(err);
        }
      });
      const channels = await interaction.guild!.channels.fetch(undefined, {
        force: true,
      });
      channels.forEach(async (channel) => {
        try {
          await channel!.delete();
        } catch (err) {
          Logger.error(err);
        }
      });
      await interaction.editReply('Channels and roles whiped successfully.');
    } catch (err) {
      console.log(err);
    }
  },
};

export default { command, config };
