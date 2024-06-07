import { StudentModel } from "@/database/models"
import {
  capitalizeFirstCharacter,
  removeDigitsFromEnd,
  sliceAtChar,
} from "@/utils/nameUtils"

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

const PGE_cycles = ["bachelor", "master"]
const PGE_suffix = "PGE "
const studentRoleName = "Étudiant"

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true })

    const code: number = interaction.options.get("code")?.value as number
    Logger.debug(
      "info",
      `verificationCodeHandler called by ${interaction.user.id} with code ${code}`
    )

    try {
      const student = await StudentModel.findOne({
        where: { verificationCode: code },
      })
      Logger.debug(
        "info",
        `verificationCodeHandler: ${interaction.user.id} with code ${code}, student ${JSON.stringify(student)}`
      )
      if (!student) {
        await interaction.editReply("Code de vérification invalide.")
        return
      }
      const login = student.getDataValue("login")
      Logger.debug("info", `${login}`)

      const config = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${process.env.SAURON_TOKEN}`,
        },
      }
      const response = await fetch(
        `https://api.sauron.epitest.eu/api/users/${login}/infos`,
        config
      )
      Logger.debug(
        "info",
        `verificationCodeHandler: ${interaction.user.id} with code ${code}, login ${login}, response: ${response.status} ${JSON.stringify(response)}`
      )
      if (!response.ok) {
        await interaction.editReply(
          `Erreur lors de la vérification du code. fetch failed ${response.status}.`
        )
        return
      }
      const data = await response.json()
      Logger.debug(
        "info",
        `verificationCodeHandler: ${interaction.user.id} with code ${code}, login ${login}, data: ${data}`
      )
      if (data.error) {
        await interaction.editReply("Erreur lors de la vérification du code.")
        return
      }

      const member = await interaction.guild?.members.fetch(interaction.user.id)
      if (!member) return
      if (data.roles.includes("student")) {
        const roles = await interaction.guild?.roles.fetch(undefined, {
          force: true,
        })
        if (PGE_cycles.includes(data.promo.cursus.code) && roles) {
          const roleName = PGE_suffix + data.promo.promotion_year.toString()
          const guildRole = roles.find((r) => r.name === roleName)
          const schoolRole = roles.find((r) => r.name === studentRoleName)
          if (!guildRole || !schoolRole) {
            return
          }
          await member.roles.add(guildRole.id)
          await member.roles.add(schoolRole.id)
        }
      }
      const loginBits = sliceAtChar(data.login, "@").split(".")
      if (loginBits.length < 2) return
      const firstName = capitalizeFirstCharacter(
        removeDigitsFromEnd(loginBits[0])
      )
      const lastName = loginBits[1].toUpperCase()
      member.setNickname(`${firstName} ${lastName}`)
      await interaction.editReply("Compte vérifié avec succès.")
    } catch (error) {
      Logger.error("error", `Error while verifying code: ${error}`)
      await interaction.editReply("Erreur lors de la vérification du code.")
    }
  },
}

export default { command, config }
