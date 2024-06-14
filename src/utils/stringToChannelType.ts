import { ChannelType } from 'discord.js';

/**
 * Converts a string to the corresponding ChannelType enum value.
 * @param type - The string representing the channel type.
 * @returns The corresponding ChannelType value.
 */
export default function stringToChannelType(
  type: string,
):
  | ChannelType.GuildAnnouncement
  | ChannelType.GuildText
  | ChannelType.GuildForum
  | ChannelType.GuildVoice {
  switch (type) {
    case 'GuildAnnouncement':
      return ChannelType.GuildAnnouncement;
    case 'GuildText':
      return ChannelType.GuildText;
    case 'GuildVoice':
      return ChannelType.GuildVoice;
    case 'GuildForum':
      return ChannelType.GuildForum;
    default:
      throw new Error(`Unknown channel type: ${type}`);
  }
}
