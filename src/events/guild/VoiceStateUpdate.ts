import { ChannelType, VoiceState } from "discord.js"
import { Logger } from "@/lib/logger"

export default async (oldState: VoiceState, newState: VoiceState) => {
  if (newState.channel && (!oldState.channel || oldState.channel !== newState.channel)) {
    if (newState.channel.name === 'rejoins-pour-créer') {
      Logger.info('User joined voice channel creator');
      const channels = await newState.guild.channels.fetch(undefined, {
        force: false
      });

      if (channels) {
        const voiceChannels = channels.filter(channel => channel && channel.name.startsWith('Voice Channel #'));

        const usedNumbers = new Set<number>();
        voiceChannels.forEach(channel => {
          if (!channel) return;
          const match = channel.name.match(/Voice Channel #(\d+)/);
          if (match) {
            const number = parseInt(match[1], 10);
            usedNumbers.add(number);
          }
        });

        // Find the first available number
        let newChannelNumber = 1;
        while (usedNumbers.has(newChannelNumber)) {
          newChannelNumber++;
        }

        const newChannelName = `Voice Channel #${newChannelNumber}`;

        const newChannel = await newState.guild?.channels.create({
          name: newChannelName,
          type: ChannelType.GuildVoice,
          parent: newState.channel.parent,
        });

        if (newChannel && newState.member) {
          Logger.info(`Move user to temporary channel: ${newChannel.name}`);
          await newState.setChannel(newChannel);
        }
      }
    }
  }

  if (oldState.channel && (!newState.channel || oldState.channel !== newState.channel)) {
    if (oldState.channel.members.size === 0 && oldState.channel.name.includes('Voice Channel')) {
      Logger.info(`Delete temporary channel ${oldState.channel.name}`);
      await oldState.channel.delete();
    }
  }
}

