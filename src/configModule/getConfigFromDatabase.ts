import { ConfigFile } from "@/configModule/types"
import { ConfigModel } from "@/database/models"

import { Logger } from "@/lib/logger"

/**
 * Get the configuration file from the database.
 * @returns Promise<ConfigFile | null>
 */
export default async function getConfigFromDatabase() {
  try {
    const config = await ConfigModel.findOne()
    if (!config) {
      Logger.debug("No config found in database")
      return null
    }
    return config.data as ConfigFile
  } catch (err) {
    Logger.debug(`Error in getConfigFromDatabase: ${err}`)
    return null
  }
}
