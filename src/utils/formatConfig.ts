import {
  ConfigFile,
  ConfigFileChannel,
  ConfigFilePromotion,
} from '@/configModule/types';

export function formatChannelName(name: string): string {
  return name.toLowerCase().trim().replace(/ /g, '-');
}

/**
 * Formats the channel names in the config to be lowercase and have spaces replaced with hyphens.
 * @param config - The config file to format.
 * @returns The formatted config file.
 */
export default function formatConfig(config: ConfigFile) {
  Object.keys(config).forEach((key) => {
    if (key === '*') {
      (config[key] as ConfigFileChannel[]).forEach((channel) => {
        channel.name = formatChannelName(channel.name);
      });
      return;
    }
    const configPromotion = config[key] as ConfigFilePromotion;
    configPromotion.modules.forEach((module) => {
      module.name = formatChannelName(module.name);
    });
    configPromotion.channels.forEach((channel) => {
      channel.name = formatChannelName(channel.name);
    });
  });
  return config;
}
