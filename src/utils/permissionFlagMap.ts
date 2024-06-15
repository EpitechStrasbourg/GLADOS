import { PermissionFlagsBits } from 'discord.js';

const permissionFlagMap: { [key: string]: bigint } = {
  KICK_MEMBERS: PermissionFlagsBits.KickMembers,
  BAN_MEMBERS: PermissionFlagsBits.BanMembers,
  MODERATE_MEMBERS: PermissionFlagsBits.ModerateMembers,
  MANAGE_MESSAGES: PermissionFlagsBits.ManageMessages,
  VIEW_AUDIT_LOG: PermissionFlagsBits.ViewAuditLog,
  MUTE_MEMBERS: PermissionFlagsBits.MuteMembers,
  DEAFEN_MEMBERS: PermissionFlagsBits.DeafenMembers,
  MOVE_MEMBERS: PermissionFlagsBits.MoveMembers,
  SEND_MESSAGES: PermissionFlagsBits.SendMessages,
  READ_MESSAGE_HISTORY: PermissionFlagsBits.ReadMessageHistory,
  CONNECT: PermissionFlagsBits.Connect,
  SPEAK: PermissionFlagsBits.Speak,
  STREAM: PermissionFlagsBits.Stream,
  VIEW_CHANNEL: PermissionFlagsBits.ViewChannel,
  PRIORITY_SPEAKER: PermissionFlagsBits.PrioritySpeaker,
};

export default permissionFlagMap;
