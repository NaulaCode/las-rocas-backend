import { Router } from 'express';
import { auditController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';

const router = Router();

router.get('/', authenticate, loadPermissions, createRequirePermission('audit:list'), (req, res, next) =>
  auditController.getLogs(req, res, next)
);

export default router;
