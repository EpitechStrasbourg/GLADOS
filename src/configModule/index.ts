import {
  CategoryChannel,
  Channel,
  ChannelType,
  DMChannel,
  Guild,
  PartialDMChannel,
  PartialGroupDMChannel,
  PrivateThreadChannel,
  PublicThreadChannel,
  Role,
} from "discord.js"

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
  private _guild: Guild

  constructor(guild: Guild, config: Config) {
    this._guild = guild
    this._config = config
  }

  getPromoFromYear(year: number): number {
    if (year === 1) return 2028
    if (year === 2) return 2027
    if (year === 3) return 2026
    return 0
  }

  async processConfig() {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    for (const key of Object.keys(this._config)) {
      const year = this.getPromoFromYear(parseInt(key.split("_")[1]))
      const promotionName = key.split("_")[0] + "_" + year.toString()

      const category = await this.initCategory(promotionName)

      const roles = await this._guild.roles.fetch(undefined, {
        force: true,
      })

      let role = roles.find((role) => role!.name === promotionName)
      await this.initCommonChannels(category!, role!)
      await this.initModules(category!, this._config[key]["modules"], key)
      await this.sortChannels(category!)
    }
  }

  async sortChannels(category: CategoryChannel) {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    const channels = await this._guild.channels.fetch(undefined, {
      force: true,
    })

    const arrayChannel = [] as Exclude<
      Channel,
      | DMChannel
      | PartialDMChannel
      | PartialGroupDMChannel
      | PrivateThreadChannel
      | PublicThreadChannel
    >[]

    channels.forEach((channel) => {
      if (channel && channel.parentId === category.id) {
        arrayChannel.push(channel)
      }
    })

    const annonceChannel = arrayChannel.find(
      (channel) => channel.name === "📣・annonces"
    )
    const generalChannel = arrayChannel.find(
      (channel) => channel.name === "💬・general"
    )
    const otherChannels = arrayChannel.filter(
      (channel) =>
        channel.name !== "📣・annonces" && channel.name !== "💬・general"
    )

    const sortedChannels = otherChannels.sort((a, b) =>
      a.name!.localeCompare(b.name!)
    )

    const orderedChannels = [
      annonceChannel,
      generalChannel,
      ...sortedChannels,
    ].filter(
      (
        channel
      ): channel is Exclude<
        Channel,
        | DMChannel
        | PartialDMChannel
        | PartialGroupDMChannel
        | PrivateThreadChannel
        | PublicThreadChannel
      > => !!channel
    )

    for (let i = 0; i < orderedChannels.length; i++) {
      await orderedChannels[i].setPosition(i)
    }
  }

  async initCategory(name: string): Promise<CategoryChannel | null> {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    const channels = await this._guild.channels.fetch(undefined, {
      force: true,
    })

    const existingChannel = channels.find(
      (channel) => channel!.name === `➖➖PROMOTION_${name}➖➖`
    )

    if (existingChannel) {
      return existingChannel as CategoryChannel
    }

    const roles = await this._guild.roles.fetch(undefined, {
      force: true,
    })

    let role = roles.find((role) => role!.name === name)

    if (!role) {
      role = await this._guild.roles.create({
        name: name,
      })
    }

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
  }

  async initCommonChannels(category: CategoryChannel, role: Role) {
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
    }
  }

  async initModules(
    category: CategoryChannel,
    modules: Module[],
    promotion_year: string
  ) {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    modules.sort((a, b) => a.name.localeCompare(b.name))

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

        await this._guild.channels.create({
          name: `${sub_module}`,
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
      }
    }
  }
}
