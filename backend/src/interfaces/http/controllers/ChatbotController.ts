import { Request, Response, NextFunction } from 'express';
import { ChatbotUseCases } from '../../../application/use-cases/ChatbotUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class ChatbotController {
  constructor(
    private chatbotUseCases: ChatbotUseCases,
    private auditLogger: IAuditLogger,
  ) {}

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.chatbotUseCases.getStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) { next(error); }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, sessionId } = req.body;
      const result = await this.chatbotUseCases.chat(query, sessionId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async chatStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, sessionId } = req.body;
      if (!query || query.trim().length === 0) {
        res.status(400).json({ status: 'error', message: 'La consulta no puede estar vacía' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      await this.chatbotUseCases.chatStream(
        query,
        sessionId,
        (token) => res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`),
        (result) => {
          res.write(`data: ${JSON.stringify({ type: 'done', ...result })}\n\n`);
          res.end();
        },
        (error) => {
          res.write(`data: ${JSON.stringify({ type: 'error', message: error })}\n\n`);
          res.end();
        },
      );
    } catch (error) {
      if (!res.headersSent) next(error);
    }
  }

  async addFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { type } = req.body;
      if (!type || !['like', 'dislike'].includes(type)) {
        res.status(400).json({ status: 'error', message: 'El tipo de feedback debe ser "like" o "dislike"' });
        return;
      }
      await this.chatbotUseCases.addFeedback(id, type);
      res.status(200).json({ status: 'success', message: 'Feedback registrado correctamente' });
    } catch (error) { next(error); }
  }

  async getAllQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const questions = await this.chatbotUseCases.getAllQuestions(activeOnly);
      res.status(200).json({ status: 'success', data: questions });
    } catch (error) { next(error); }
  }

  async createQuestion(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await this.chatbotUseCases.createQuestion(req.body);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'CREATE', entityType: 'chatbot_question', entityId: question.id });
      res.status(201).json({ status: 'success', message: 'Pregunta creada correctamente', data: question });
    } catch (error) { next(error); }
  }

  async updateQuestion(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const question = await this.chatbotUseCases.updateQuestion(id, req.body);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'chatbot_question', entityId: id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Pregunta actualizada correctamente', data: question });
    } catch (error) { next(error); }
  }

  async deleteQuestion(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.chatbotUseCases.deleteQuestion(id);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'chatbot_question', entityId: id });
      res.status(200).json({ status: 'success', message: 'Pregunta eliminada correctamente' });
    } catch (error) { next(error); }
  }
}
