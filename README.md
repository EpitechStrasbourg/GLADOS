# Project Setup and Usage Guide

## Environment Configuration

First, copy the example environment variables file:

```bash
cp .env.example .env
```

### Environment Variables

Ensure you set the following variables in your `.env` file:

| Variable               | Default Value | Description                                                                 |
|------------------------|---------------|-----------------------------------------------------------------------------|
| `DISCORD_TOKEN`        | -             | The token for authenticating the Discord bot.                               |
| `DISCORD_APP_ID`       | -             | The application ID for the Discord bot.                                     |
| `DEBUG`                | false         | A flag to enable or disable debug mode.                                     |
| `SEQUELIZE_LOGGING`    | false         | A flag to enable or disable Sequelize logging.                              |
| `NODE_ENV`             | -             | The environment in which the application is running (`dev`, `production`).  |
| `POSTGRES_USER`        | -             | The username for the PostgreSQL database.                                   |
| `POSTGRES_PASSWORD`    | -             | The password for the PostgreSQL database.                                   |
| `POSTGRES_DB`          | -             | The name of the PostgreSQL database.                                        |
| `POSTGRES_HOST`        | -             | The host of the PostgreSQL database, typically the service name in Docker Compose. |
| `POSTGRES_PORT`        | -             | The port on which PostgreSQL is running.                                    |
| `SAURON_TOKEN`         | -             | A token for the Sauron service (assumed to be another API or service).      |
| `GUILD_ID`             | -             | The ID of the Discord guild (server) the bot operates in.                   |
| `BOT_MAILER`           | -             | The email address used by the bot for sending emails.                       |
| `BOT_MAILER_PASSWORD`  | -             | The password for the bot's email address.                                   |
| `BOT_MAILER_SERVICE`   | gmail         | The email service provider (e.g., `gmail`).                                 |

## Docker Setup

To build and run the project using Docker:

```bash
sudo docker compose build && sudo docker compose up
```

## Local Setup

To set up the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure database migrations are up-to-date:
   ```bash
   npm run db:migrate up
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. For production builds:
   ```bash
   npm run prod
   ```

## Usage

### Adding Slash Commands

1. Create a `.ts` file in `src/commands/slash` with the same name as the command (in the relative subfolder if in a category).
2. The command will be automatically registered when the bot starts.

### Creating a Command File

Create a new command using TypeScript. The file must export the following objects:

```ts
import { SlashCommand, SlashCommandConfig } from '@/types/command';

const config: SlashCommandConfig = {
  // Configuration properties here
};

const command: SlashCommand = {
  // Command execution logic here
};

export default { command, config };
```

> **Note:** You can see all the type definitions in `src/types/command.ts`.

#### SlashCommandConfig

The `config` object contains all the information about the command that will be loaded.

| Property    | Type             | Required | Description                                                           |
| ----------- | ---------------- | -------- | --------------------------------------------------------------------- |
| `name`      | `string`         | No       | The name of the command. If not defined, the filename is used instead |
| `description`| `string`        | Yes      | The description of the command.                                       |
| `usage`     | `string`         | No       | The usage of the command.                                             |
| `category`  | `string`         | No       | The category of the command.                                          |
| `nsfw`      | `boolean`        | No       | Whether this command is NSFW or not (Default: false).                 |
| `options`   | `Array<Options>` | No       | The list of options for this command.                                 |

> **Important:** The `fileName` property is automatically added to the config object. Do not add it manually.

#### SlashCommand

The `command` object contains the function that will be executed when the command is called. It also contains the `permissions` for the command. See the [Permissions Guide](https://discordjs.guide/popular-topics/permissions.html#permissions) for more information.

#### Options

The list of options for this command.

| Property    | Type             | Required | Description                                               | Valid in Types                |
| ----------- | ---------------- | -------- | --------------------------------------------------------- | ----------------------------- |
| `name`      | `string`         | Yes      | The name of the option.                                   | All                           |
| `description`| `string`        | Yes      | The description of the option.                            | All                           |
| `type`      | `string`         | Yes      | The type of the option. See [Option Types](#option-types) | All                           |
| `required`  | `boolean`        | No       | Whether this option is required or not (Default: false).  | All                           |
| `choices`   | `Array<Choices>` | No       | The list of choices for this option.                      | `INTEGER \| NUMBER \| STRING` |
| `minValue`  | `number`         | No       | The minimum value of the option.                          | `INTEGER \| NUMBER`           |
| `maxValue`  | `number`         | No       | The maximum value of the option.                          | `INTEGER \| NUMBER`           |

##### Choice Properties

The properties of each choice within the `choices` array.

| Property | Type               | Description                                                                         |
| -------- | ------------------ | ----------------------------------------------------------------------------------- |
| `name`   | `string`           | The name of the choice.                                                             |
| `value`  | `string \| number` | The value of the choice (the available value is based on the type of the option).   |

#### Option Types

For further information on option types, see the [Discord documentation](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type).

| Type          | Description                      |
| ------------- | -------------------------------- |
| `STRING`      | Represents a string value.       |
| `BOOLEAN`     | Represents a boolean value.      |
| `NUMBER`      | Represents a numeric value.      |
| `INTEGER`     | Represents an integer value.     |
| `ROLE`        | Represents a role.               |
| `USER`        | Represents a user.               |
| `CHANNEL`     | Represents a channel.            |
| `MENTIONABLE` | Represents a mentionable entity. |
| `ATTACHMENT`  | Represents an attachment.        |

### Events

Events are automatically registered when the bot starts. To add an event, create a file in `src/events/<event_source>` with the name of the event and export the event function as default.

| Event Source | Description                                   |
| ------------ | --------------------------------------------- |
| `client`     | Events emitted by the client (e.g., `ready`)  |
| `guild`      | Events emitted by a guild (e.g., interactions)|

For a list of events, see the [DiscordJS documentation](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Events).