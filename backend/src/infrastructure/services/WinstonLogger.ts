import { ILogger } from '../../domain/ports/ILogger';
import { logger } from '../../shared/logger/logger';

export class WinstonLogger implements ILogger {
  info(message: string, meta?: object): void {
    logger.info(message, meta);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack });
    } else {
      logger.error(message, { error });
    }
  }

  warn(message: string, meta?: object): void {
    logger.warn(message, meta);
  }

  debug(message: string, meta?: object): void {
    logger.debug(message, meta);
  }
}
