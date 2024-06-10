import _cleanOldPromotions from "@/configModule/cleanOldPromotions"
import _deleteNotFoundChannels from "@/configModule/deleteNotFoundChannels"
import _findOrCreateCategory from "@/configModule/findOrCreateCategory"
import _findOrCreateRole from "@/configModule/findOrCreateRole"
import _formatConfig from "@/configModule/formatConfig"
import _generateCommonForPromotion from "@/configModule/generateCommonForPromotion"
import _getConfigFromDatabase from "@/configModule/getConfigFromDatabase"
import _initChannels from "@/configModule/initChannels"
import _initModules from "@/configModule/initModules"
import _saveConfigToDatabase from "@/configModule/saveConfigToDatabase"
import _sortChannelsInCategory from "@/configModule/sortChannelsInCategory"
import _sortPromotionCatetegory from "@/configModule/sortPromotionCategory"
import {
  ConfigFile,
  ConfigFileChannel,
  ConfigFileModule,
  ConfigFilePromotion,
} from "@/configModule/types"
import _updateConfigChannel from "@/configModule/updateConfigChannel"
import getTekYearFromPromotion from "@/utils/getTekYearFromPromotion"
import { CategoryChannel, Guild, Role } from "discord.js"

import { SlashCommandInteraction } from "@/types/command"

export default class ConfigModule {
  private _config: ConfigFile
  private _guild: Guild
  private _interaction: SlashCommandInteraction
  private _processedCategory: CategoryChannel[]

  constructor(
    guild: Guild,
    config: ConfigFile,
    interaction: SlashCommandInteraction
  ) {
    if (!guild) throw new Error("Guild must be provided.")
    if (!config) throw new Error("Config must be provided.")
    if (!interaction) throw new Error("Interaction must be provided.")

    this._guild = guild
    this._config = config
    this._interaction = interaction
    this._processedCategory = [] as CategoryChannel[]

    this._config = this.formatConfig(this._config)
  }

  private async logBot(message: string) {
    await this._interaction.editReply(message)
  }

  private formatConfig(configFile: ConfigFile) {
    return _formatConfig(configFile)
  }

  async processConfig() {
    /* FETCH ROLES AND CHANNELS TO FILL THE BOT CACHE */

    await this._guild.channels.fetch(undefined, { force: true })
    await this._guild.roles.fetch(undefined, { force: true })
    await this.logBot("Fetched roles and channels")

    /* INITIALIZE CATEGORIES CHANNELS PROMOTIONS */

    for (const key of Object.keys(this._config)) {
      if (key === "*") continue
      if (!key.includes("_") || key.split("_").length !== 2)
        throw new Error(`Invalid key: ${key}`)

      const promotion = `${key.split("_")[0]} ${getTekYearFromPromotion(parseInt(key.split("_")[1]))}`

      const category = await this.initCategory(promotion)

      if (!category)
        throw new Error(`Failed to initialize category for ${promotion}`)
      this._processedCategory.push(category!)
      this.logBot(`Initialized category for ${promotion}`)
    }

    /* PROCESS COMMON CHANNELS FOR PROMOTION ["*"] */

    await this.generateCommonForPromotion()
    await this.logBot("Initialized common channels")

    /* PROCESS EACH PROMOTIONS CHANNELS AND MODULES */

    for (const key of Object.keys(this._config)) {
      if (key === "*") continue

      const configPromotion = this._config[key] as ConfigFilePromotion
      const promotion = `${key.split("_")[0]} ${getTekYearFromPromotion(parseInt(key.split("_")[1]))}`
      const category = await this.initCategory(promotion)

      if (!category)
        throw new Error(`Failed to initialize category for ${promotion}`)

      const role = await this.findOrCreateRole(promotion)

      await this.initChannels(category, configPromotion.channels, role)
      await this.initModules(category, configPromotion.modules, key)

      await this.deleteNotFoundChannels(category, key)

      await this.sortChannelsInCategory(
        category,
        configPromotion.channels,
        this._config["*"]
      )
      await this.logBot(`Initialized channels and modules for ${promotion}`)
    }
    /* CLEAN OLD PROMOTIONS CHANNELS AND MODULES */

    await this.cleanOldPromotions()
    await this.logBot("Cleaned old promotions")

    /* SORT PROMOTIONS BY YEAR */

    await this.sortPromotionCatetegory()
    await this.logBot("Sorted promotions")
  }

  async deleteNotFoundChannels(category: CategoryChannel, key: string) {
    return await _deleteNotFoundChannels(
      this._guild,
      this._config,
      key,
      category
    )
  }

  async cleanOldPromotions() {
    return await _cleanOldPromotions(
      this._guild,
      this._processedCategory,
      this._config
    )
  }

  async generateCommonForPromotion() {
    return await _generateCommonForPromotion(this._guild, this._config)
  }

  private async sortChannelsInCategory(
    category: CategoryChannel,
    channelsConfig: ConfigFileChannel[],
    commonChannels: ConfigFileChannel[]
  ) {
    return await _sortChannelsInCategory(
      this._guild,
      category,
      channelsConfig,
      commonChannels
    )
  }

  private async initCategory(name: string): Promise<CategoryChannel | null> {
    return await _findOrCreateCategory(this._guild, name)
  }

  private async initChannels(
    category: CategoryChannel,
    channelsConfig: ConfigFileChannel[],
    role: Role
  ) {
    return await _initChannels(this._guild, category, channelsConfig, role)
  }

  private async initModules(
    category: CategoryChannel,
    modules: ConfigFileModule[],
    promotionName: string
  ) {
    return await _initModules(category, modules, promotionName, this._guild)
  }

  private async findOrCreateRole(roleName: string): Promise<Role> {
    return await _findOrCreateRole(this._guild, roleName)
  }

  public static async getConfigFromDatabase(): Promise<ConfigFile | null> {
    return await _getConfigFromDatabase()
  }

  public static async saveConfigToDatabase(
    configFile: ConfigFile
  ): Promise<boolean> {
    return await _saveConfigToDatabase(configFile)
  }

  public static async updateConfigChannel(
    guild: Guild,
    configFile: ConfigFile
  ) {
    return await _updateConfigChannel(guild, configFile)
  }

  async sortPromotionCatetegory() {
    return await _sortPromotionCatetegory(this._guild)
  }
}
