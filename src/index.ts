import connectToDatabase, { sequelize } from "@/database"
import handleEvents from "@/handlers/eventHandler"
import JobController from "@/jobs"
import loadSlashCommands from "@/loaders/slashCommands"
import { GatewayIntentBits, IntentsBitField, REST, Routes } from "discord.js"
import syncConfig from "@/jobs/syncConfig"
import DiscordClient from "@/lib/client"
import Logger from "@/lib/logger"

import { env } from "./env"

interface DiscordResponse {
  length: number
}

const client = DiscordClient.getInstance({
  intents: [
    GatewayIntentBits.Guilds,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMembers,
  ],
})

// Refresh application slash commands
const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN)
;(async () => {
  try {
    await connectToDatabase(sequelize)
    const jobController = new JobController()
    jobController.create(() => {
      syncConfig(client);
    }, "* * * * *")
    Logger.debug("Started refreshing application (/) commands.")

    const { slashCommands, slashConfigs } = await loadSlashCommands()

    const res = (await rest.put(
      Routes.applicationCommands(env.GUILD_ID!),
      {
        body: slashCommands,
      }
    )) as DiscordResponse

    client.slashConfigs = slashConfigs

    Logger.debug(`Successfully reloaded ${res.length} (/) commands.`)
    client.login(env.DISCORD_TOKEN)
  } catch (error) {
    Logger.error(`Error refreshing application (/) commands: \n\t${error}`)
  }
})()

// Handle application events
handleEvents()
