import { Router } from 'express';
import { uploadController } from '../../../di/container';
import { upload } from '../middlewares/uploadRestrictions';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { uploadLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/', authenticate, loadPermissions, createRequirePermission('uploads:create'), uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Error al subir archivo';
      res.status(400).json({ status: 'error', code: 'UPLOAD_ERROR', message });
      return;
    }
    uploadController.uploadImage(req, res, next);
  });
});

export default router;
