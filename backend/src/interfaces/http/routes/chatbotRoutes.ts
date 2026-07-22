import { Router } from 'express';
import { chatbotController } from '../../../di/container';
import { authenticate } from '../middlewares/authMiddleware';
import { loadPermissions } from '../../../di/container';
import { createRequirePermission } from '../middlewares/permissionMiddleware';
import { chatLimiter } from '../middlewares/rateLimit';

const router = Router();

// Públicas
router.post('/chat', chatLimiter, (req, res, next) =>
  chatbotController.chat(req, res, next)
);
router.post('/chat/stream', chatLimiter, (req, res, next) =>
  chatbotController.chatStream(req, res, next)
);
router.get('/questions', (req, res, next) =>
  chatbotController.getAllQuestions(req, res, next)
);
router.put('/logs/:id/feedback', (req, res, next) =>
  chatbotController.addFeedback(req, res, next)
);

// Admin
router.get('/stats', authenticate, loadPermissions, createRequirePermission('chatbot:list'), (req, res, next) =>
  chatbotController.getStats(req, res, next)
);
router.post('/seed', authenticate, loadPermissions, createRequirePermission('chatbot:create'), (req, res, next) =>
  chatbotController.seedAndReindex(req, res, next)
);
router.post('/reindex', authenticate, loadPermissions, createRequirePermission('chatbot:create'), (req, res, next) =>
  chatbotController.reindexEmbeddings(req, res, next)
);
router.post('/questions', authenticate, loadPermissions, createRequirePermission('chatbot:create'), (req, res, next) =>
  chatbotController.createQuestion(req, res, next)
);
router.put('/questions/:id', authenticate, loadPermissions, createRequirePermission('chatbot:update'), (req, res, next) =>
  chatbotController.updateQuestion(req, res, next)
);
router.delete('/questions/:id', authenticate, loadPermissions, createRequirePermission('chatbot:delete'), (req, res, next) =>
  chatbotController.deleteQuestion(req, res, next)
);

export default router;
