import ConfigModule from "@/configModule"
import axios from "axios"

import { SlashCommand, SlashCommandConfig } from "@/types/command"
import { Logger } from "@/lib/logger"

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

    const configModule = new ConfigModule(
      interaction.guild!,
      file.data,
      interaction
    )

    await interaction.reply({
      content: "Config file loaded successfully",
      ephemeral: true,
    })

    Logger.info("Processing config file...")
    await configModule.processConfig()
    Logger.info("Config file processed successfully")

    await interaction.editReply({ content: "Config updated successfully." })
  },
}

export default { command, config }
