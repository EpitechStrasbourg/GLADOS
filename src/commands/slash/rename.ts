import {
  renamedChannelPattern,
  temporaryChannelPattern,
} from "@/events/guild/VoiceStateUpdate"

import { SlashCommand, SlashCommandConfig } from "@/types/command"
import { Logger } from "@/lib/logger"

const config: SlashCommandConfig = {
  description: "Rename your temporary channel",
  usage: "/rename",
  options: [
    {
      name: "name",
      description: "The new name of your channel",
      type: "STRING",
      required: true,
    },
  ],
}

const command: SlashCommand = {
  execute: async (interaction) => {
    const name = interaction.options.get("name")?.value as string
    const member = await interaction.guild?.members.fetch(interaction.user.id)

    if (member?.voice.channel) {
      const channel = member.voice.channel
      let match =
        channel.name.match(temporaryChannelPattern) ||
        channel.name.match(renamedChannelPattern)

      if (match) {
        const originalNumber = match[1] || match[2]
        const newChannelName = `${name} - Voice Chat #${originalNumber}`
        await channel.setName(newChannelName)
        await interaction.reply(`Your channel is now named ${newChannelName}.`)
        Logger.info(
          `Channel renamed to: ${newChannelName} by ${interaction.user.tag}`
        )
      } else {
        await interaction.reply("You can only rename temporary channels.")
      }
    } else {
      await interaction.reply(
        "You need to be in a voice channel to use this command."
      )
    }
  },
}

export default { command, config }
