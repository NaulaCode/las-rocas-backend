import { Router } from 'express';
import { attractionController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';

const router = Router();

router.get('/', (req, res, next) => attractionController.getAll(req, res, next));
router.get('/category/:category', (req, res, next) => attractionController.getByCategory(req, res, next));
router.get('/:id', (req, res, next) => attractionController.getById(req, res, next));
router.post('/', authenticate, loadPermissions, createRequirePermission('attractions:create'), (req, res, next) => attractionController.create(req, res, next));
router.put('/:id', authenticate, loadPermissions, createRequirePermission('attractions:update'), (req, res, next) => attractionController.update(req, res, next));
router.delete('/:id', authenticate, loadPermissions, createRequirePermission('attractions:delete'), (req, res, next) => attractionController.delete(req, res, next));

export default router;
