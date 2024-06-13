import env from '@/env';
import chalk from 'chalk';

export default class Logger {
  private static _getTimeStamp() {
    return `[${new Date().toISOString()}]`;
  }

  public static log(...messages: unknown[]) {
    console.log(
      `${chalk.green('[LOG]')} ${this._getTimeStamp()} ${messages.join(' ')}`,
    );
  }

  public static info(...messages: unknown[]) {
    console.log(
      `${chalk.blue('[INFO]')} ${this._getTimeStamp()} ${messages.join(' ')}`,
    );
  }

  public static error(...messages: unknown[]) {
    console.error(
      `${chalk.red('[ERROR]')} ${this._getTimeStamp()} ${messages.join(' ')}`,
    );
  }

  public static warn(...messages: unknown[]) {
    console.warn(
      `${chalk.yellow('[WARN]')} ${this._getTimeStamp()} ${messages.join(' ')}`,
    );
  }

  public static debug(...messages: unknown[]) {
    if (env.DEBUG === false) return;
    console.debug(
      `${chalk.magenta('[DEBUG]')} ${this._getTimeStamp()} ${messages.join(' ')}`,
    );
  }
}
