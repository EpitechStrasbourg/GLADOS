import { SlashCommand, SlashCommandConfig } from "@/types/command"

const config: SlashCommandConfig = {
  description: "Show the latency of the bot",
  usage: "/pong",
  options: [
    {
      name: "emoji",
      description: "The emoji to use",
      type: "STRING",
      required: false,
    },
  ],
}

const command: SlashCommand = {
  // permissions: 0,
  execute: async (interaction) => {
    const pong = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    })

    const emoji = interaction.options.get("emoji")?.value ?? "🏓"

    await interaction.editReply(
      `Ping ${emoji}! Latency is ${pong.createdTimestamp - interaction.createdTimestamp}ms.`
    )
  },
}

export default { command, config }
