import ConfigModule from "@/configModule"
import axios from "axios"

import { SlashCommand, SlashCommandConfig } from "@/types/command"
import Logger from "@/lib/logger"
import { acquireLock, isLockAcquired, releaseLock } from "@/utils/configMutex"

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
    try {
      let answer = false;
      let content = "A config is already being processed. Please wait..."
      const config = interaction.options.get("config_file")

      const file = await axios.get(config!.attachment!.url)

      while (isLockAcquired()) {
        if (content.includes("..."))
          content = content.slice(0, -3)
        if (!answer) {
          await interaction.reply({
            content: content,
          });
          answer = true;
        }
        else {
          await interaction.editReply({
            content: content,
          });
        }
        content = content + "."

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      acquireLock();
      const configModule = new ConfigModule(
        interaction.guild!,
        file.data,
        interaction
      )

      if (!answer)
        await interaction.reply({
          content: "Config file loaded successfully",
          ephemeral: true,
        })
      else {
        await interaction.editReply({
          content: "Config file loaded successfully",
        })
      }

      Logger.info("Processing config file...")
      await configModule.processConfig()
      Logger.info("Config file processed successfully")
      await ConfigModule.saveConfigToDatabase(file.data)
      Logger.info("Config file saved to database")
      await ConfigModule.updateConfigChannel(interaction.guild!, file.data)
      Logger.info("Config file updated in channel")
      await interaction.editReply({ content: "Config updated successfully." })
    } catch (err) {
      Logger.error("Error while processing config file: ", err)
      await interaction.editReply({
        content: "Error while processing config file.",
      })
    }
    releaseLock();
  },
}

export default { command, config }
