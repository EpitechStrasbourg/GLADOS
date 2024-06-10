export interface ConfigFileChannel {
  name: string
  type: 'GuildAnnouncement' | 'GuildText' | 'GuildForum'
}

export interface ConfigFileModule {
  name: string
  sub_modules: string[]
}

export interface ConfigFilePromotion {
  modules: ConfigFileModule[]
  channels: ConfigFileChannel[]
}

export interface ConfigFile {
  [key: string]: ConfigFilePromotion | ConfigFileChannel[]
  '*': ConfigFileChannel[]
}
