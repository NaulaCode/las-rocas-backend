import { Router } from 'express';
import { authController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { authLimiter, forgotPasswordLimiter } from '../middlewares/rateLimit';

const router = Router();

// Públicas
router.post('/login', authLimiter, (req, res, next) =>
  authController.login(req, res, next)
);
router.post('/forgot-password', forgotPasswordLimiter, (req, res, next) =>
  authController.forgotPassword(req, res, next)
);
router.post('/reset-password', (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.me(req, res, next)
);
router.get('/me/permissions', authenticate, loadPermissions, (req, res, next) =>
  authController.myPermissions(req, res, next)
);

// Admin
router.post('/register', authenticate, loadPermissions, createRequirePermission('users:create'), (req, res, next) =>
  authController.register(req, res, next)
);
router.get('/users', authenticate, loadPermissions, createRequirePermission('users:list'), (req, res, next) =>
  authController.listUsers(req, res, next)
);
router.put('/users/:id', authenticate, loadPermissions, createRequirePermission('users:update'), (req, res, next) =>
  authController.updateUser(req, res, next)
);
router.delete('/users/:id', authenticate, loadPermissions, createRequirePermission('users:delete'), (req, res, next) =>
  authController.deleteUser(req, res, next)
);

export default router;
