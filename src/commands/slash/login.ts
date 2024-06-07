import { UserModel } from "@/database/models"
import isValidEpitechMail from "@/utils/isValidEpitechMail"
import sendEmailToUser from "@/utils/mailer"
import generateVerificationCode from "@/utils/verificationCode"

import { SlashCommand, SlashCommandConfig } from "@/types/command"
import { Logger } from "@/lib/logger"

const config: SlashCommandConfig = {
  description: "Utilise cette commande pour te connecter à ton compte Epitech.",
  usage: "/login",
  options: [
    {
      name: "email",
      description: "prenom.nom@epitech.eu",
      type: "STRING",
      required: true,
    },
  ],
}

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true })

    const email: string =
      interaction.options.get("email")?.value?.toString() ?? ""
    Logger.debug(
      "info",
      `loginHandler called by ${interaction.user.id} with email ${email}`
    )

    if (!isValidEpitechMail(email)) {
      interaction.editReply(
        "Veuillez entrer un e-mail Epitech (prénom.nom@epitech.eu)"
      )
      return
    }

    try {
      const verificationCode = generateVerificationCode()

      Logger.debug(
        "info",
        `loginHandler: ${interaction.user.id} with email ${email} verification code: ${verificationCode}`
      )
      await sendEmailToUser(email, verificationCode)

      if (await UserModel.findOne({ where: { login: email } })) {
        UserModel.update(
          { verificationCode: verificationCode },
          { where: { login: email } }
        )
      } else {
        await UserModel.create({
          discordId: interaction.user.id,
          login: email,
          verificationCode: verificationCode,
        })
      }

      Logger.debug(
        "info",
        `loginHandler: ${interaction.user.id} with email ${email} verification code: ${verificationCode} sent`
      )
      interaction.editReply(
        "Un code de vérification a été envoyé sur ton adresse mail Epitech.\nRentre le à l'aide de la commande **/verification**."
      )
    } catch (e) {
      interaction.editReply("Une erreur est survenue.")
      Logger.error(
        "error",
        `loginHandler: ${interaction.user.id} with email ${email} error: ${e}`
      )
    }
  },
}

export default { command, config }
