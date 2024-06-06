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


interface ChannelConfig {
  name: string;
  type: "GuildAnnouncement" | "GuildText" | "GuildForum";
};
interface Module {
  name: string
  sub_modules: string[]
}

interface Promotion {
  modules: Module[]
  channels: ChannelConfig[] 
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

  formatChannelName(name: string): string {
    return name.toLowerCase().trim().replaceAll(" ", "-")
  }

  typeToChannelType(type: string): ChannelType.GuildAnnouncement | ChannelType.GuildText | ChannelType.GuildForum {
    if (type === "GuildAnnouncement") return ChannelType.GuildAnnouncement
    if (type === "GuildText") return ChannelType.GuildText
    if (type === "GuildForum") return ChannelType.GuildForum
    return ChannelType.GuildText
  }

  getPromoFromYear(year: number): number {
    if (year === 1) return 2029
    if (year === 2) return 2027
    if (year === 3) return 2026
    return 0
  }

  formatConfig = () => {
    for (const key of Object.keys(this._config)) {
      for (const module of this._config[key].modules) {
        module.name = this.formatChannelName(module.name)
      }
      for (const channel of this._config[key].channels) {
        channel.name = this.formatChannelName(channel.name)
      }
    }
  }

  
  async processConfig() {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    this.formatConfig()
    for (const key of Object.keys(this._config)) {
      const year = this.getPromoFromYear(parseInt(key.split("_")[1]))
      const promotionName = key.split("_")[0] + "_" + year.toString()

      const category = await this.initCategory(promotionName)

      const roles = await this._guild.roles.fetch(undefined, {
        force: true,
      })

      let role = roles.find((role) => role!.name === promotionName)
      await this.initChannels(category!, this._config[key]["channels"]  ,role!)
      await this.initModules(category!, this._config[key]["modules"], key)
      await this.sortChannels(category!, this._config[key]["channels"])
    }
  }

  async sortChannels(category: CategoryChannel, channelsConfig: ChannelConfig[]) {
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
  
    const configChannels = arrayChannel.filter((channel) =>
      channelsConfig.some((config) => config.name === channel.name)
    )
  
    const otherChannels = arrayChannel.filter(
      (channel) => !channelsConfig.some((config) => config.name === channel.name)
    )
  
    const sortedOtherChannels = otherChannels.sort((a, b) =>
      a.name!.localeCompare(b.name!)
    )
  
    const orderedChannels = [
      ...configChannels,
      ...sortedOtherChannels,
    ]
  
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

  async initChannels(category: CategoryChannel, channelsConfig: ChannelConfig[], role: Role) {
    if (!this._guild) {
      throw new Error("Guild not found.")
    }

    const channels = await this._guild.channels.fetch(undefined, {
      force: true,
    })


    for (const channelConfig of channelsConfig) {

      const existingChannel = channels.find(
        (channel) => {
          return channel!.type === this.typeToChannelType(channelConfig.type) &&
          channel!.name === channelConfig.name &&
          channel!.parentId === category.id
        }
      )

      if (existingChannel) {
        continue
      }

      await this._guild.channels.create({
        name: channelConfig.name,
        type: this.typeToChannelType(channelConfig.type),
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
        (role) => role!.name === `${promotion_year}_${module.name}`
      )
      if (!role) {
        role = await this._guild.roles.create({
          name:`${promotion_year}_${module.name}`,
        })
      }

      const channels = await this._guild.channels.fetch(undefined, {
        force: true,
      })


        const existingChannel = channels.find(
          (channel) =>
            channel!.type === ChannelType.GuildForum &&
            channel!.name === module.name &&
            channel!.parentId === category.id
        )
        if (existingChannel) {
          continue
        }

        await this._guild.channels.create({
          name: `${module.name}`,
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
