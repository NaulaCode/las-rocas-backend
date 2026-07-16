import { Request, Response, NextFunction } from 'express';
import { NewsUseCases } from '../../../application/use-cases/NewsUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class NewsController {
  constructor(
    private newsUseCases: NewsUseCases,
    private auditLogger: IAuditLogger,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publishedOnly = req.query.published === 'true';
      const news = await this.newsUseCases.getAll(publishedOnly);
      res.status(200).json({ status: 'success', data: news });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const news = await this.newsUseCases.getById(id);
      res.status(200).json({ status: 'success', data: news });
    } catch (error) { next(error); }
  }

  async getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.params.type as string;
      const news = await this.newsUseCases.getByType(type);
      res.status(200).json({ status: 'success', data: news });
    } catch (error) { next(error); }
  }

  async create(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const news = await this.newsUseCases.create(req.body);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'CREATE', entityType: 'news', entityId: news.id });
      res.status(201).json({ status: 'success', message: 'Noticia/Evento creado correctamente', data: news });
    } catch (error) { next(error); }
  }

  async update(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const news = await this.newsUseCases.update(id, req.body);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'news', entityId: id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Noticia/Evento actualizado correctamente', data: news });
    } catch (error) { next(error); }
  }

  async delete(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.newsUseCases.delete(id);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'news', entityId: id });
      res.status(200).json({ status: 'success', message: 'Noticia/Evento eliminado correctamente' });
    } catch (error) { next(error); }
  }
}
