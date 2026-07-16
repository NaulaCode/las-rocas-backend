import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 1 minuto.',
  },
});

export const reservationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas subidas. Intenta de nuevo en 1 hora.',
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
});

export const publicPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiados mensajes. Intenta de nuevo en 1 minuto.',
  },
});

export const reservationPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Demasiadas reservas. Intenta de nuevo en 1 minuto.',
  },
});
