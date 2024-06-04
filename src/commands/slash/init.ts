import ConfigModule from "@/configModule"
import axios from "axios"

import { SlashCommand, SlashCommandConfig } from "@/types/command"

const config: SlashCommandConfig = {
  description: "Init the channels and roles according to the config",
  usage: "/init",
  options: [
    {
      name: "pge1_current",
      description: "PGE1 current year",
      type: "NUMBER",
      required: true,
    },
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
    const year = interaction.options.get("pge1_current")

    const file = await axios.get(config!.attachment!.url)

    const configModule = new ConfigModule(file.data, year!.value as number)

    await interaction.reply({
      content: "Config file loaded successfully",
      ephemeral: true,
    })

    await configModule.initChannels(interaction)

    await interaction.editReply({ content: "Channels created successfully" })
  },
}

export default { command, config }
