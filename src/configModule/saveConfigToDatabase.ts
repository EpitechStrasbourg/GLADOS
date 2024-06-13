import { ConfigFile } from '@/configModule/types';
import ConfigModel from '@/database/models/model.config';
import Logger from '@/lib/logger';

/**
 * Save the configuration file to the database.
 * @param configFile The configuration file to save.
 * @returns Promise<boolean>
 */
export default async function saveConfigFromDatabase(
  configFile: ConfigFile,
): Promise<boolean> {
  try {
    const config = await ConfigModel.findOne();
    if (!config) {
      await ConfigModel.create({ data: configFile });
    } else {
      config.set('data', configFile);
      await config.save();
    }
    return true;
  } catch (err) {
    Logger.debug(`Error in saveConfigToDatabase: ${err}`);
    return false;
  }
}
