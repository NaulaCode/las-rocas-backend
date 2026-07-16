import { Router, Request, Response } from 'express';
import { config } from '../../../shared/config/config';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Bienvenido a la API de Las Rocas Turismo',
  });
});

export default router;
