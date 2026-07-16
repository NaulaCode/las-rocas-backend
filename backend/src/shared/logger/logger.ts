import winston from 'winston';
import { config } from '../config/config';

// Formato para desarrollo (fácil de leer)
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Formato para producción (JSON estructurado)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Crear el logger
export const logger = winston.createLogger({
  level: config.logger.level,
  transports: [
    new winston.transports.Console({
      format: config.server.isDevelopment
        ? developmentFormat
        : productionFormat,
    }),
  ],
});

// Métodos de conveniencia
export const log = {
  info: (message: string, meta?: object) =>
    logger.info(message, meta),

  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      logger.error(message, {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error(message, { error });
    }
  },

  warn: (message: string, meta?: object) =>
    logger.warn(message, meta),

  debug: (message: string, meta?: object) =>
    logger.debug(message, meta),

  http: (message: string, meta?: object) =>
    logger.http(message, meta),
};