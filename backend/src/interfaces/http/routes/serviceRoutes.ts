import { Router } from 'express';
import { serviceController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { validate } from '../middlewares/validate';
import { createServiceSchema, updateServiceSchema } from '../../../shared/validation/schemas';

const router = Router();

router.get('/', (req, res, next) =>
  serviceController.getAll(req, res, next)
);
router.get('/category/:category', (req, res, next) =>
  serviceController.getByCategory(req, res, next)
);
router.get('/:id', (req, res, next) =>
  serviceController.getById(req, res, next)
);
router.post('/', authenticate, loadPermissions, createRequirePermission('services:create'), validate(createServiceSchema), (req, res, next) =>
  serviceController.create(req, res, next)
);
router.put('/:id', authenticate, loadPermissions, createRequirePermission('services:update'), validate(updateServiceSchema), (req, res, next) =>
  serviceController.update(req, res, next)
);
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('services:delete'), (req, res, next) =>
  serviceController.delete(req, res, next)
);

export default router;
