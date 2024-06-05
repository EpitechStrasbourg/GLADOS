import ConfigModule from "@/configModule"
import axios from "axios"

import { SlashCommand, SlashCommandConfig } from "@/types/command"

const config: SlashCommandConfig = {
  description: "Init the channels and roles according to the config",
  usage: "/init",
  options: [
    {
      name: "config_file",
      description: "The .json config file",
      type: "ATTACHMENT",
      required: true,
    },
  ],
}

const command: SlashCommand = {
  // permissions: 0,
  execute: async (interaction) => {
    const config = interaction.options.get("config_file")

    const file = await axios.get(config!.attachment!.url)

    const configModule = new ConfigModule(interaction.guild!, file.data)

    await interaction.reply({
      content: "Config file loaded successfully",
      ephemeral: true,
    })

    await configModule.processConfig()

    await interaction.editReply({ content: "Channels created successfully" })
  },
}

export default { command, config }
