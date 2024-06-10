import fs from 'fs';
import path from 'path';
import { Events, type Awaitable } from 'discord.js';

import DiscordClient from '@/lib/client';
import Logger from '@/lib/logger';

/**
 * Subdirectories in `events` folder
 */
const eventsSubdirectories = ['client', 'guild'] as const;

/**
 * Load all events file in `events` folder.
 * Only `.ts` files are loaded and files starting with an underscode (`_`) are ignored.
 */
export default function handleEvents() {
  const client = DiscordClient.getInstance();

  const loadEvents = async (dir: string): Promise<number> => {
    let loadedEvents = 0;
    const eventFiles = fs
      .readdirSync(path.join(__dirname, `../events/${dir}`))
      .filter(
        (file) => (file.endsWith('.ts') || file.endsWith('.js'))
          && !file.startsWith('_'),
      );

    eventFiles.forEach(async (file) => {
      const eventName = file.split('.')[0] as keyof typeof Events;

      // Skip invalid events
      if (!(eventName in Events)) {
        Logger.warn(`Invalid event name '${eventName}', skipping...`);
        return;
      }

      try {
        const rawModule = await import(`../events/${dir}/${file}`);
        const eventModule = rawModule.default?.default
          ? rawModule.default
          : rawModule;

        if (!eventModule.default) {
          throw new Error(`Missing default export in '${file}'`);
        }
        const eventFunction: (...args: unknown[]) => Awaitable<void> = eventModule.default;

        // @ts-expect-error Events contains all client events so this is fine
        client.on(Events[eventName], eventFunction);
        loadedEvents += 1;
      } catch (err) {
        Logger.error(
          `Failed to load event '${eventName}': \n\t${(err as Error).message}`,
        );
      }
    });

    return loadedEvents;
  };

  eventsSubdirectories.forEach(async (dir) => {
    try {
      const loadedEvents = await loadEvents(dir);
      Logger.debug(`Loaded ${loadedEvents} events from '${dir}'`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
      Logger.error(
        `Failed to load events in ${dir}: \n\t${(err as Error).message}`,
      );
    }
  });
}
