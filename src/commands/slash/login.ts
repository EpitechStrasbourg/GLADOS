import { UserModel } from '@/database/models';
import isValidEpitechMail from '@/utils/isValidEpitechMail';
import sendEmailToUser from '@/utils/mailer';
import generateVerificationCode from '@/utils/verificationCode';

import { SlashCommand, SlashCommandConfig } from '@/types/command';
import Logger from '@/lib/logger';
import { Op } from 'sequelize';

const config: SlashCommandConfig = {
  description: 'Utilisez cette commande pour vous connecter à votre compte Epitech.',
  usage: '/login',
  options: [
    {
      name: 'email',
      description: 'prenom.nom@epitech.eu',
      type: 'STRING',
      required: true,
    },
  ],
};

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const email: string = interaction.options.get('email')?.value?.toString() ?? '';
    Logger.debug(
      'info',
      `loginHandler called by ${interaction.user.id} with email ${email}`,
    );

    if (!isValidEpitechMail(email)) {
      interaction.editReply(
        'Veuillez entrer un e-mail Epitech (prénom.nom@epitech.eu)',
      );
      return;
    }

    try {
      const where = {
        [Op.or]: [
          { login: email },
          { discordId: interaction.user.id },
        ],
      };
      // verify if the user is already in the database and verify if the user is already verified
      const user = await UserModel.findOne({ where });
      if (user && user.verified) {
        interaction.editReply('Votre compte est déjà vérifié.');
        return;
      }

      // verify 5 minutes between each email
      if (user && new Date().getTime() - user.updatedAt.getTime() < 300000) {
        interaction.editReply(
          'Un email a déjà été envoyé il y a moins de 5 minutes. Veuillez patienter.',
        );
        return;
      }

      const verificationCode = generateVerificationCode();

      Logger.debug(
        'info',
        `loginHandler: ${interaction.user.id} with email ${email} verification code: ${verificationCode}`,
      );
      await sendEmailToUser(email, verificationCode, interaction.user.tag);

      if (user) {
        await UserModel.update(
          { verificationCode },
          { where },
        );
      } else {
        await UserModel.create({
          discordId: interaction.user.id,
          login: email,
          verificationCode,
          verified: false,
        });
      }

      Logger.debug(
        'info',
        `loginHandler: ${interaction.user.id} with email ${email} verification code: ${verificationCode} sent`,
      );
      interaction.editReply(
        "Un code de vérification a été envoyé sur votre adresse mail Epitech.\nRentrez le à l'aide de la commande **/verification**.",
      );
    } catch (e) {
      interaction.editReply('Une erreur est survenue.');
      Logger.error(
        'error',
        `loginHandler: ${interaction.user.id} with email ${email} error: ${e}`,
      );
    }
  },
};

export default { command, config };
