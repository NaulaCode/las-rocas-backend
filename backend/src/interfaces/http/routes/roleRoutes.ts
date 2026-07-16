import { Router } from 'express';
import { roleController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';

const router = Router();

router.get('/permissions', authenticate, loadPermissions, createRequirePermission('roles:list'), (req, res, next) =>
  roleController.getPermissions(req, res, next)
);
router.get('/', authenticate, loadPermissions, createRequirePermission('roles:list'), (req, res, next) =>
  roleController.getAll(req, res, next)
);
router.get('/:id', authenticate, loadPermissions, createRequirePermission('roles:list'), (req, res, next) =>
  roleController.getById(req, res, next)
);
router.post('/', authenticate, loadPermissions, createRequirePermission('roles:create'), (req, res, next) =>
  roleController.create(req, res, next)
);
router.put('/:id', authenticate, loadPermissions, createRequirePermission('roles:update'), (req, res, next) =>
  roleController.update(req, res, next)
);
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('roles:delete'), (req, res, next) =>
  roleController.delete(req, res, next)
);

export default router;
