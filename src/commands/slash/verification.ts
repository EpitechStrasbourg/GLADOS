import { Student } from "@/database/models"

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
    Logger.debug("info", `verificationCodeHandler called by ${interaction.user.id} with code ${code}`)

    try {
      const student = await Student.findOne({ where: { verificationCode: code }, raw: false })
      Logger.debug("info", `verificationCodeHandler: ${interaction.user.id} with code ${code}, student ${JSON.stringify(student)}`)
      if (!student) {
        interaction.editReply("Code de vérification invalide.")
        return
      }
      const login = student.getDataValue("login")
      Logger.debug("info", `${login}`)
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${process.env.SAURON_TOKEN}`
        }
      }
      const response = await fetch(`https://api.sauron.epitest.eu/api/users/${login}/infos`, config)
      Logger.debug("info", `verificationCodeHandler: ${interaction.user.id} with code ${code}, login ${login}, response: ${response.status} ${JSON.stringify(response)}`)
      if (!response.ok) {
        interaction.editReply(`Erreur lors de la vérification du code. fetch failed ${response.status}.`)
        return
      }
      const data = await response.json()
      Logger.debug("info", `verificationCodeHandler: ${interaction.user.id} with code ${code}, login ${login}, data: ${data}`)
      if (data.error) {
        interaction.editReply("Erreur lors de la vérification du code.")
        return
      }
      // attribuer les roles
      interaction.editReply("Compte vérifié avec succès.")
    } catch (error) {
      Logger.error("error", `Error while verifying code: ${error}`)
      interaction.editReply("Erreur lors de la vérification du code.")
    
    }
  },
}

export default { command, config }
