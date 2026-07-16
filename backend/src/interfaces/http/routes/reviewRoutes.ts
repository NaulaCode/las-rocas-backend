import { Router } from 'express';
import { reviewController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { validate } from '../middlewares/validate';
import { createReviewSchema } from '../../../shared/validation/schemas';
import { publicPostLimiter } from '../middlewares/rateLimit';
import { validateTurnstile } from '../middlewares/turnstile';

const router = Router();

// Públicas
router.post('/', publicPostLimiter, validateTurnstile, validate(createReviewSchema), (req, res, next) =>
  reviewController.submit(req, res, next)
);
router.get('/approved', (req, res, next) =>
  reviewController.getApproved(req, res, next)
);
router.get('/average', (req, res, next) =>
  reviewController.getAverageByService(req, res, next)
);

// Admin
router.get('/', authenticate, loadPermissions, createRequirePermission('reviews:list'), (req, res, next) =>
  reviewController.getAll(req, res, next)
);
router.patch('/:id/approve', authenticate, loadPermissions, createRequirePermission('reviews:approve'), (req, res, next) =>
  reviewController.approve(req, res, next)
);
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('reviews:delete'), (req, res, next) =>
  reviewController.delete(req, res, next)
);

export default router;
