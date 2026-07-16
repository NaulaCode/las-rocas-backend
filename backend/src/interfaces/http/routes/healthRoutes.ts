import { Router, Request, Response } from 'express';
import { config } from '../../../shared/config/config';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Las Rocas API funcionando correctamente',
    version: config.server.apiVersion,
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export default router;
