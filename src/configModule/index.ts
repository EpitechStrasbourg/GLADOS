import path from "path"
import { CategoryChannel, ChannelType, Guild, SortOrderType } from "discord.js"

interface Module {
  name: string
  sub_modules: string[]
}

interface Promotion {
  promotion_year: number
  modules: Module[]
}

interface Config {
  [key: string]: Promotion
}

export default class ConfigModule {
  private _config: Config = {}
  private _guild: Guild | null = null

  constructor(config: Config, guild: Guild) {
    this._config = config
    this._guild = guild
  }

  async processConfig() {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    for (const key of Object.keys(this._config)) {
      const category = await this.initCategory(
        `➖➖PROMOTION_${this._config[key]["promotion_year"]}➖➖`
      )
      await this.initCommonChannels(category!)
      this.initModules(
        category!,
        this._config[key]["modules"],
        this._config[key]["promotion_year"]
      )
    }
  }

  async initCategory(name: string): Promise<CategoryChannel | null> {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    const channels = await this._guild.channels.fetch(undefined, {
      force: true,
    })

    const existingChannel = channels.find((channel) => channel!.name === name)

    if (existingChannel) {
      return existingChannel as CategoryChannel
    }

    return await this._guild.channels.create({
      name: name,
      type: ChannelType.GuildCategory,
    })
  }

  async initCommonChannels(category: CategoryChannel) {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    const channels = await this._guild.channels.fetch(undefined, {
      force: true,
    })

    const annonceChannel = channels.find(
      (channel) =>
        channel!.type === ChannelType.GuildAnnouncement &&
        channel!.name === "📣・annonces" &&
        channel!.parentId === category.id
    )
    if (!annonceChannel) {
      await this._guild.channels.create({
        name: "📣・annonces",
        type: ChannelType.GuildAnnouncement,
        parent: category,
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const generalChannel = channels.find(
      (channel) =>
        channel!.type === ChannelType.GuildText &&
        channel!.name === "💬・general" &&
        channel!.parentId === category.id
    )

    if (!generalChannel) {
      await this._guild.channels.create({
        name: "💬・general",
        type: ChannelType.GuildText,
        parent: category,
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  async initModules(
    category: CategoryChannel,
    modules: Module[],
    promotion_year: number
  ) {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    for (const module of modules) {
      const roles = await this._guild.roles.fetch(undefined, {
        force: true,
      })
      let role = roles.find(
        (role) => role!.name === `${module.name}_${promotion_year}`
      )
      if (!role) {
        role = await this._guild.roles.create({
          name: `${module.name}_${promotion_year}`,
        })
      }

      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })

      for (const sub_module of module.sub_modules) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const existingChannel = channels.find(
          (channel) =>
            channel!.type === ChannelType.GuildForum &&
            channel!.name.toLowerCase() === sub_module.toLocaleLowerCase() &&
            channel!.parentId === category.id
        )
        if (existingChannel) {
          continue
        }

        const subModuleChannel = await this._guild.channels.create({
          name: `${sub_module}`,
          type: ChannelType.GuildForum,
          parent: category,
        })
        await subModuleChannel.permissionOverwrites.create(role, {
          ViewChannel: true,
        })
      }
    }
  }
}
