import { Request, Response, NextFunction } from 'express';
import { config } from '../../../shared/config/config';

export async function validateTurnstile(req: Request, res: Response, next: NextFunction) {
  if (!config.turnstile.secretKey) {
    return next();
  }

  const token = req.body?.turnstileToken;

  if (!token) {
    res.status(400).json({
      status: 'error',
      code: 'TURNSTILE_REQUIRED',
      message: 'Falta verificación de seguridad. Recarga la página e intenta de nuevo.',
    });
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', config.turnstile.secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json() as { success: boolean; 'error-codes'?: string[] };

    if (!outcome.success) {
      res.status(403).json({
        status: 'error',
        code: 'TURNSTILE_FAILED',
        message: 'Verificación de seguridad fallida. Intenta de nuevo.',
      });
      return;
    }

    next();
  } catch {
    res.status(500).json({
      status: 'error',
      code: 'TURNSTILE_ERROR',
      message: 'Error al validar la verificación de seguridad.',
    });
  }
}
