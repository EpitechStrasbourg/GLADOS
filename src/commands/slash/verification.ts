import { UserModel } from '@/database/models';
import {
  fetchUserData, fetchUserRoadblocks, syncRolesAndRename, syncRolesModules,
} from '@/utils/userSynchronization';

import { SlashCommand, SlashCommandConfig } from '@/types/command';
import Logger from '@/lib/logger';

const config: SlashCommandConfig = {
  description: 'Utilisez cette commande pour vérifier votre compte Epitech.',
  usage: '/verification',
  options: [
    {
      name: 'code',
      description: 'Code de vérification envoyé par email',
      type: 'NUMBER',
      required: true,
    },
  ],
};

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const code: number = interaction.options.get('code')?.value as number;
    Logger.debug('info', `verificationCodeHandler called with code ${code}`);

    try {
      const user = await UserModel.findOne({
        where: { verificationCode: code },
      });
      if (!user) {
        await interaction.editReply('Code de vérification invalide.');
        return;
      }
      if (user.verified) {
        await interaction.editReply('Votre compte est déjà vérifié.');
        return;
      }
      const login = user.getDataValue('login');
      const userData = await fetchUserData(login);
      if (!userData) {
        await interaction.editReply(
          'Erreur lors de la récupération des données',
        );
        return;
      }
      await syncRolesAndRename(
        interaction.guild!,
        interaction.user.id,
        userData,
      );
      const roadblockData = await fetchUserRoadblocks(login);
      if (roadblockData) await syncRolesModules(interaction.guild!, interaction.user.id, roadblockData);

      await UserModel.update(
        { verified: true },
        { where: { login } },
      );
      await interaction.editReply('Compte vérifié avec succès.');
    } catch (error) {
      Logger.error('error', `Error while verifying code: ${error}`);
      await interaction.editReply('Erreur lors de la vérification du code.');
    }
  },
};

export default { command, config };
