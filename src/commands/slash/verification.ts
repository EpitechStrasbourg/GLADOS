import { SlashCommand, SlashCommandConfig } from "@/types/command";
import { Logger } from "@/lib/logger";
import { UserModel } from "@/database/models";
import { syncRolesAndRename, fetchUserData } from "@/utils/authentication";

const config: SlashCommandConfig = {
  description: "Utilise cette commande pour vérifier votre compte Epitech.",
  usage: "/verification",
  options: [
    {
      name: "code",
      description: "Code de vérification envoyé par email",
      type: "NUMBER",
      required: true,
    },
  ],
};

const command: SlashCommand = {
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const code: number = interaction.options.get("code")?.value as number;
    Logger.debug("info", `verificationCodeHandler called with code ${code}`);

    try {
      const user = await UserModel.findOne({ where: { verificationCode: code } });
      if (!user) {
        await interaction.editReply("Code de vérification invalide.");
        return;
      }
      const login = user.getDataValue('login');
      const userData = await fetchUserData(login);
      if (!userData) {
        await interaction.editReply("Erreur lors de la récupération des données");
        return;
      }
      await syncRolesAndRename(interaction.guild!, interaction.user.id, userData);
      await interaction.editReply("Compte vérifié avec succès.");
    } catch (error) {
      Logger.error("error", `Error while verifying code: ${error}`);
      await interaction.editReply("Erreur lors de la vérification du code.");
    }
  },
};

export default { command, config };
