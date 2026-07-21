import { Request, Response, NextFunction } from 'express';
import { TouristicAttractionUseCases } from '../../../application/use-cases/TouristicAttractionUseCases';
import { ChatbotUseCases } from '../../../application/use-cases/ChatbotUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class TouristicAttractionController {
  constructor(
    private useCases: TouristicAttractionUseCases,
    private auditLogger: IAuditLogger,
    private chatbotUseCases?: ChatbotUseCases,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const items = await this.useCases.getAll(activeOnly);
      res.status(200).json({ status: 'success', data: items });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await this.useCases.getById(id);
      res.status(200).json({ status: 'success', data: item });
    } catch (error) { next(error); }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.params.category as string;
      const items = await this.useCases.getByCategory(category);
      res.status(200).json({ status: 'success', data: items });
    } catch (error) { next(error); }
  }

  async create(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await this.useCases.create(req.body);
      this.chatbotUseCases?.clearContextCache();
      this.chatbotUseCases?.reindexEntity('attraction', item.id, `Atracción turística: ${item.name}. ${item.description || ''}. Categoría: ${item.category || ''}. Ubicación: ${item.location || ''}. Horario: ${item.schedule || ''}.`);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'CREATE', entityType: 'attraction', entityId: item.id });
      res.status(201).json({ status: 'success', message: 'Atractivo turístico creado correctamente', data: item });
    } catch (error) { next(error); }
  }

  async update(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await this.useCases.update(id, req.body);
      this.chatbotUseCases?.clearContextCache();
      this.chatbotUseCases?.reindexEntity('attraction', id, `Atracción turística: ${item.name}. ${item.description || ''}. Categoría: ${item.category || ''}. Ubicación: ${item.location || ''}. Horario: ${item.schedule || ''}.`);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'attraction', entityId: id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Atractivo turístico actualizado correctamente', data: item });
    } catch (error) { next(error); }
  }

  async delete(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.useCases.delete(id);
      this.chatbotUseCases?.clearContextCache();
      this.chatbotUseCases?.removeEntityEmbedding('attraction', id);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'attraction', entityId: id });
      res.status(200).json({ status: 'success', message: 'Atractivo turístico eliminado correctamente' });
    } catch (error) { next(error); }
  }
}
