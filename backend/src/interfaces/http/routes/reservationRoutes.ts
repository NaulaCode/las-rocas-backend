import { Router } from 'express';
import { reservationController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { reservationPostLimiter, reservationLimiter } from '../middlewares/rateLimit';
import { validateTurnstile } from '../middlewares/turnstile';

const router = Router();

// Públicas
router.get('/availability/month', (req, res, next) =>
  reservationController.getMonthAvailability(req, res, next)
);
router.get('/availability', (req, res, next) =>
  reservationController.getAvailability(req, res, next)
);
router.get('/by-email/:email', (req, res, next) =>
  reservationController.getByEmail(req, res, next)
);
router.get('/:id', (req, res, next) =>
  reservationController.getById(req, res, next)
);
router.post('/', reservationPostLimiter, validateTurnstile, (req, res, next) =>
  reservationController.create(req, res, next)
);
router.post('/cancel', (req, res, next) =>
  reservationController.cancel(req, res, next)
);

// Admin
router.get('/', authenticate, loadPermissions, createRequirePermission('reservations:list'), reservationLimiter, (req, res, next) =>
  reservationController.getAll(req, res, next)
);
router.get('/stats', authenticate, loadPermissions, createRequirePermission('reservations:list'), (req, res, next) =>
  reservationController.getStats(req, res, next)
);
router.get('/monthly', authenticate, loadPermissions, createRequirePermission('reservations:list'), (req, res, next) =>
  reservationController.getMonthly(req, res, next)
);
router.get('/top-services', authenticate, loadPermissions, createRequirePermission('reservations:list'), (req, res, next) =>
  reservationController.getTopServices(req, res, next)
);
router.put('/:id', authenticate, loadPermissions, createRequirePermission('reservations:update'), (req, res, next) =>
  reservationController.update(req, res, next)
);
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('reservations:delete'), (req, res, next) =>
  reservationController.delete(req, res, next)
);

export default router;
