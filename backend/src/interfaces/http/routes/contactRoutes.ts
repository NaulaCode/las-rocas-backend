import { Router } from 'express';
import { contactController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { publicPostLimiter } from '../middlewares/rateLimit';
import { validateTurnstile } from '../middlewares/turnstile';
import { validate } from '../middlewares/validate';
import { createContactMessageSchema } from '../../../shared/validation/schemas';

const router = Router();

router.post('/', publicPostLimiter, validateTurnstile, validate(createContactMessageSchema), (req, res, next) =>
  contactController.send(req, res, next)
);
router.get('/', authenticate, loadPermissions, createRequirePermission('contact:list'), (req, res, next) =>
  contactController.getAll(req, res, next)
);
router.patch('/:id/read', authenticate, loadPermissions, createRequirePermission('contact:update'), (req, res, next) =>
  contactController.markAsRead(req, res, next)
);
router.get('/unread-count', authenticate, loadPermissions, createRequirePermission('contact:list'), (req, res, next) =>
  contactController.countUnread(req, res, next)
);

export default router;
