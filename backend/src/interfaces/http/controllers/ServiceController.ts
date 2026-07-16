import { Request, Response, NextFunction } from 'express';
import { ServiceUseCases } from '../../../application/use-cases/ServiceUseCases';
import { ChatbotUseCases } from '../../../application/use-cases/ChatbotUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class ServiceController {
  constructor(
    private serviceUseCases: ServiceUseCases,
    private auditLogger: IAuditLogger,
    private chatbotUseCases?: ChatbotUseCases,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const services = await this.serviceUseCases.getAll(activeOnly);
      res.status(200).json({ status: 'success', data: services });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const service = await this.serviceUseCases.getById(id);
      res.status(200).json({ status: 'success', data: service });
    } catch (error) { next(error); }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.params.category as string;
      const services = await this.serviceUseCases.getByCategory(category);
      res.status(200).json({ status: 'success', data: services });
    } catch (error) { next(error); }
  }

  async create(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await this.serviceUseCases.create(req.body);
      this.chatbotUseCases?.clearContextCache();
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'CREATE', entityType: 'service', entityId: service.id });
      res.status(201).json({ status: 'success', message: 'Servicio creado correctamente', data: service });
    } catch (error) { next(error); }
  }

  async update(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const service = await this.serviceUseCases.update(id, req.body);
      this.chatbotUseCases?.clearContextCache();
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'service', entityId: id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Servicio actualizado correctamente', data: service });
    } catch (error) { next(error); }
  }

  async delete(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.serviceUseCases.delete(id);
      this.chatbotUseCases?.clearContextCache();
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'service', entityId: id });
      res.status(200).json({ status: 'success', message: 'Servicio eliminado correctamente' });
    } catch (error) { next(error); }
  }
}
