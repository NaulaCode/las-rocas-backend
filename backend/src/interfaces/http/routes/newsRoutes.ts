import { Router } from 'express';
import { newsController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';

const router = Router();

router.get('/', (req, res, next) =>
  newsController.getAll(req, res, next)
);
router.get('/type/:type', (req, res, next) =>
  newsController.getByType(req, res, next)
);
router.get('/:id', (req, res, next) =>
  newsController.getById(req, res, next)
);
router.post('/', authenticate, loadPermissions, createRequirePermission('news:create'), (req, res, next) =>
  newsController.create(req, res, next)
);
router.put('/:id', authenticate, loadPermissions, createRequirePermission('news:update'), (req, res, next) =>
  newsController.update(req, res, next)
);
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('news:delete'), (req, res, next) =>
  newsController.delete(req, res, next)
);

export default router;
