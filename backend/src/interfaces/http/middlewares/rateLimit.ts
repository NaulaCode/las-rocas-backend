import rateLimit from 'express-rate-limit';
import { config } from '../../../shared/config/config';

const isDev = config.server.isDevelopment;

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
});

export const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas reservas. Intenta de nuevo en 15 minutos.',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas subidas. Intenta de nuevo en 1 hora.',
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 20 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en 15 minutos.',
  },
});

export const publicPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 30 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
});

export const reservationPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 20 : 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas reservas. Intenta de nuevo en 1 minuto.',
  },
});
