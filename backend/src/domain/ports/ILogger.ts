export interface ILogger {
  info(message: string, meta?: object): void;
  error(message: string, error?: unknown): void;
  warn(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}
