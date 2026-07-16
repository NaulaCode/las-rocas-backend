import { Router } from 'express';
import { organizationController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';

const router = Router();

router.get('/', (req, res, next) =>
  organizationController.get(req, res, next)
);
router.put('/', authenticate, loadPermissions, createRequirePermission('organization:update'), (req, res, next) =>
  organizationController.update(req, res, next)
);

export default router;
