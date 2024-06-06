import { Student } from "@/database/models"
import isValidEpitechMail from "@/utils/isValidEpitechMail"
import sendEmailToUser from "@/utils/mailer"
import generateVerificationCode from "@/utils/verificationCode"

import { SlashCommand, SlashCommandConfig } from "@/types/command"
import { Logger } from "@/lib/logger"

const config: SlashCommandConfig = {
  description: "Utilise cette commande pour te verifier votre compte Epitech.",
  usage: "/verification",
  options: [
    {
      name: "code",
      description: "verification code sent to your email",
      type: "NUMBER",
      required: true,
    },
  ],
}

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true })

    const code: number = interaction.options.get("code")?.value as number
    Logger.debug(
      "info",
      `verificationCodeHandler called by ${interaction.user.id} with code ${code}`
    )

    try {
      const student = await Student.findOne({
        where: { verificationCode: code },
      })

      if (!student) {
        interaction.editReply("Code de vérification invalide.")
        return
      }
      // verifier sur sauron les info de l'etudiant et lui attribuer les roles correspondants cc flo
      interaction.editReply("Compte vérifié avec succès.")
    } catch (error) {
      Logger.error("error", `Error while verifying code: ${error}`)
      interaction.editReply("Erreur lors de la vérification du code.")
    }
  },
}

export default { command, config }
