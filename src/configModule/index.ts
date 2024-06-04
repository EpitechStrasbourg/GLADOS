import path from "path"

import { SlashCommandInteraction } from "@/types/command"

export default class ConfigModule {
  private _config = {}
  private _academic_year = -1

  constructor(config: Object, academic_year: number) {
    this._config = config
    this._academic_year = academic_year
  }

  async initChannels(interaction: SlashCommandInteraction) {
    await interaction.guild!.channels.create({
      name: "CACA PROUT 2030",
    })
  }
}
