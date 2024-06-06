import {
  CategoryChannel,
  Channel,
  ChannelType,
  DMChannel,
  Guild,
  Interaction,
  PartialDMChannel,
  PartialGroupDMChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
  Role,
} from "discord.js"

import { SlashCommandInteraction } from "@/types/command"

// Interface for defining the structure of each channel in the configuration file
// You can add more channel types here if needed but make sure to update the stringToChannelType function
interface ConfigFileChannel {
  name: string
  type: "GuildAnnouncement" | "GuildText" | "GuildForum"
}

// Interface for defining the structure of each module in the configuration file
interface ConfigFileModule {
  name: string
  sub_modules: string[]
}

// Interface for defining the promotion structure in the configuration file
interface ConfigFilePromotion {
  modules: ConfigFileModule[]
  channels: ConfigFileChannel[]
}

// Interface for the overall configuration file structure
interface ConfigFile {
  [key: string]: ConfigFilePromotion
}

// Class to handle the configuration and initialization of Discord server categories, channels, and roles
export default class ConfigModule {
  private _config: ConfigFile
  private _guild: Guild
  private _interaction: SlashCommandInteraction

  /**
   * Constructor to initialize the ConfigModule with the guild and configuration file.
   * @param guild - The Discord guild where the configuration will be applied.
   * @param config - The configuration data for the guild setup.
   */
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
  }

  /**
   * Formats a channel name to a standard form: lowercase and spaces replaced with hyphens.
   * @param name - The original channel name.
   * @returns The formatted channel name.
   */
  private formatChannelName(name: string): string {
    return name.toLowerCase().trim().replace(/ /g, "-")
  }

  /**
   * Converts a string to the corresponding ChannelType enum value.
   * @param type - The string representing the channel type.
   * @returns The corresponding ChannelType value.
   */
  private stringToChannelType(
    type: string
  ):
    | ChannelType.GuildAnnouncement
    | ChannelType.GuildText
    | ChannelType.GuildForum {
    switch (type) {
      case "GuildAnnouncement":
        return ChannelType.GuildAnnouncement
      case "GuildText":
        return ChannelType.GuildText
      case "GuildForum":
        return ChannelType.GuildForum
      default:
        throw new Error(`Unknown channel type: ${type}`)
    }
  }

  /**
   * Returns the promotion year based on the provided year number.
   * @param year - The year number (1, 2, or 3).
   * @returns The corresponding year as a number.
   */
  private getPromoFromYear(year: number): number {
    if (year === 1) return 2028
    if (year === 2) return 2027
    if (year === 3) return 2026
    return 0
  }

  /**
   * Formats the configuration to ensure consistent naming.
   * Applies formatting to module and channel names.
   */
  private formatConfig() {
    Object.keys(this._config).forEach((key) => {
      this._config[key].modules.forEach((module) => {
        module.name = this.formatChannelName(module.name)
      })
      this._config[key].channels.forEach((channel) => {
        channel.name = this.formatChannelName(channel.name)
      })
    })
  }

  /**
   * Processes the entire configuration, setting up categories, channels, modules, and roles.
   */
  async processConfig() {
    this.formatConfig()

    for (const key of Object.keys(this._config)) {
      if (!key.includes("_") || key.split("_").length !== 2)
        throw new Error(`Invalid key: ${key}`)

      // Extract the promotion name and year
      const year = this.getPromoFromYear(parseInt(key.split("_")[1]))
      const promotionName = `${key.split("_")[0]}_${year}`

      // Initialize or find the category for the promotion
      const category = await this.initCategory(promotionName)

      if (!category)
        throw new Error(`Failed to initialize category for ${promotionName}`)

      // Create or find the role associated with the promotion
      const role = await this.findOrCreateRole(promotionName)

      // Initialize the channels and modules in the category
      await this.initChannels(category, this._config[key].channels, role)
      await this.initModules(category, this._config[key].modules, promotionName)

      // Delete module and channels that are not in the configuration
      await this.deleteCategoryModuleNotInConfig(category, key)
      await this.deleteChannelNotInConfig(category, key)

      // Sort the channels in the category according to the configuration
      await this.sortChannels(category, this._config[key].channels)
    }
  }

  /**
   * Sorts channels in the specified category based on the configuration.
   * Channels specified in the config are ordered first, others are sorted alphabetically.
   * @param category - The category containing the channels to sort.
   * @param channelsConfig - The configuration for ordering channels.
   */
  private async sortChannels(
    category: CategoryChannel,
    channelsConfig: ConfigFileChannel[]
  ) {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      const categorizedChannels: Exclude<
        Channel,
        | DMChannel
        | PartialDMChannel
        | PartialGroupDMChannel
        | PrivateThreadChannel
        | PublicThreadChannel
      >[] = []

      channels.forEach((channel) => {
        if (channel && channel.parentId === category.id) {
          categorizedChannels.push(channel)
        }
      })

      // Separate channels based on whether they are in the config or not
      const configChannels = categorizedChannels.filter((channel) =>
        channelsConfig.some((config) => config.name === channel.name)
      )

      // Sort config channels based on their order in the configuration
      configChannels.sort(
        (a, b) =>
          channelsConfig.findIndex((config) => config.name === a.name) -
          channelsConfig.findIndex((config) => config.name === b.name)
      )

      // Other channels not in the config are sorted alphabetically
      const otherChannels = categorizedChannels.filter(
        (channel) =>
          !channelsConfig.some((config) => config.name === channel.name)
      )

      const sortedOtherChannels = otherChannels.sort((a, b) =>
        a.name!.localeCompare(b.name!)
      )

      // Combine ordered channels and set their positions
      const orderedChannels = [...configChannels, ...sortedOtherChannels]

      for (let i = 0; i < orderedChannels.length; i++) {
        await orderedChannels[i].setPosition(i)
      }
      this._interaction.editReply({
        content: `Channels sorted for ${category.name}`,
      })
    } catch (err) {
      throw new Error(`Failed to sort channels for ${category.name}`)
    }
  }

  /**
   * Initializes a category for the promotion if it doesn't already exist.
   * @param name - The name of the promotion (category).
   * @returns The initialized or existing category channel.
   */
  private async initCategory(name: string): Promise<CategoryChannel | null> {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      const existingChannel = channels.find(
        (channel) => channel && channel.name === `➖➖PROMOTION_${name}➖➖`
      ) as CategoryChannel

      if (existingChannel) return existingChannel

      const role = await this.findOrCreateRole(name.toUpperCase())

      return await this._guild.channels.create({
        name: `➖➖PROMOTION_${name}➖➖`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            deny: ["ViewChannel"],
            id: this._guild.id,
          },
          {
            allow: ["ViewChannel"],
            id: role.id,
          },
        ],
      })
    } catch (err) {
      throw new Error(`Failed to initialize category for ${name}`)
    }
  }

  /**
   * Initializes channels within a specified category based on the configuration.
   * @param category - The category where channels will be created or verified.
   * @param channelsConfig - The configuration data for the channels.
   * @param role - The role that will have permissions in the channels.
   */
  private async initChannels(
    category: CategoryChannel,
    channelsConfig: ConfigFileChannel[],
    role: Role
  ) {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      for (const channelConfig of channelsConfig) {
        const existingChannel = channels.find(
          (channel) =>
            channel &&
            channel.type === this.stringToChannelType(channelConfig.type) &&
            channel.name === channelConfig.name &&
            channel.parentId === category.id
        )

        if (!existingChannel) {
          await this._guild.channels.create({
            name: channelConfig.name,
            type: this.stringToChannelType(channelConfig.type),
            parent: category,
            permissionOverwrites: [
              {
                deny: ["ViewChannel"],
                id: this._guild.id,
              },
              {
                allow: ["ViewChannel"],
                id: role.id,
              },
            ],
          })
          await this._interaction.editReply({
            content: `Channel ${channelConfig.name} created`,
          })
        }
      }
    } catch (err) {
      throw new Error(`Failed to initialize channels for ${category.name}`)
    }
  }

  /**
   * Initializes module channels within a specified category based on the configuration.
   * Modules are created as Forum channels with specific roles.
   * @param category - The category where module channels will be created.
   * @param modules - The configuration data for the modules.
   * @param promotionName - The name of the promotion for role naming.
   */
  private async initModules(
    category: CategoryChannel,
    modules: ConfigFileModule[],
    promotionName: string
  ) {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      for (const module of modules) {
        const role = await this.findOrCreateRole(
          `${promotionName}_${module.name}`
        )

        const existingChannel = channels.find(
          (channel) =>
            channel &&
            channel.type === ChannelType.GuildForum &&
            channel.name === module.name &&
            channel.parentId === category.id
        )

        if (!existingChannel) {
          await this._guild.channels.create({
            name: module.name,
            type: ChannelType.GuildForum,
            parent: category,
            permissionOverwrites: [
              {
                deny: ["ViewChannel"],
                id: this._guild.id,
              },
              {
                allow: ["ViewChannel"],
                id: role.id,
              },
            ],
          })
          await this._interaction.editReply({
            content: `Module ${module.name} created`,
          })
        }
      }
    } catch (err) {
      throw new Error(`Failed to initialize modules for ${category.name}`)
    }
  }

  /**
   * Finds an existing role by name or creates it if it doesn't exist.
   * @param roleName - The name of the role to find or create.
   * @returns The found or newly created role.
   */
  private async findOrCreateRole(roleName: string): Promise<Role> {
    try {
      const roles = await this._guild.roles.fetch(undefined, { force: true })
      let role = roles.find((role) => role.name === roleName)

      if (!role) {
        role = await this._guild.roles.create({
          name: roleName,
        })
        this._interaction.editReply({
          content: `Role ${roleName} created`,
        })
      }

      return role
    } catch (err) {
      throw new Error(`Failed to find or create role: ${roleName}`)
    }
  }

  /**
   * Deletes forum channels in the specified category that are not in the config.
   *
   * @param category - The category channel to check.
   * @param key - The config key containing the expected modules.
   * @returns Promise<void>
   */
  async deleteCategoryModuleNotInConfig(
    category: CategoryChannel,
    key: string
  ) {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      for (const channel of channels.values()) {
        if (
          channel!.parentId === category.id &&
          channel!.type === ChannelType.GuildForum
        ) {
          const module = this._config[key].modules.find(
            (m) => m.name === channel!.name
          )
          if (!module) {
            await channel!.delete()
            await this._interaction.editReply({
              content: `Module ${channel!.name} deleted`,
            })
          }
        }
      }
    } catch (err) {
      throw new Error(`Failed to delete modules for ${category.name}`)
    }
  }

  /**
   * Deletes non-forum channels in the specified category that are not in the config.
   *
   * @param category - The category channel to check.
   * @param key - The config key containing the expected channels.
   * @returns Promise<void>
   */
  async deleteChannelNotInConfig(category: CategoryChannel, key: string) {
    try {
      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      for (const channel of channels.values()) {
        if (
          channel!.parentId === category.id &&
          channel!.type !== ChannelType.GuildForum
        ) {
          const configChannel = this._config[key].channels.find(
            (c) => c.name === channel!.name
          )
          if (!configChannel) {
            await channel!.delete()
            await this._interaction.editReply({
              content: `Channel ${channel!.name} deleted`,
            })
          }
        }
      }
    } catch (err) {
      throw new Error(`Failed to delete channels for ${category.name}`)
    }
  }
}
