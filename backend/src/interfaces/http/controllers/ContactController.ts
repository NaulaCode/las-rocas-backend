import { Request, Response, NextFunction } from 'express';
import { ContactUseCases } from '../../../application/use-cases/ContactUseCases';
import { IWebSocketNotifier } from '../../../domain/ports/IWebSocketNotifier';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class ContactController {
  constructor(
    private contactUseCases: ContactUseCases,
    private auditLogger: IAuditLogger,
    private wsNotifier: IWebSocketNotifier,
  ) {}

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await this.contactUseCases.send(req.body);
      this.wsNotifier.broadcast('new-contact-message', { id: message.id });
      res.status(201).json({ status: 'success', message: 'Mensaje enviado correctamente', data: message });
    } catch (error) { next(error); }
  }

  async getAll(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await this.contactUseCases.getAll();
      res.status(200).json({ status: 'success', data: messages });
    } catch (error) { next(error); }
  }

  async markAsRead(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.contactUseCases.markAsRead(req.params.id as string);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'contact_message', entityId: req.params.id, details: { isRead: true } });
      res.status(200).json({ status: 'success', message: 'Mensaje marcado como leído' });
    } catch (error) { next(error); }
  }

  async countUnread(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await this.contactUseCases.countUnread();
      res.status(200).json({ status: 'success', data: { count } });
    } catch (error) { next(error); }
  }
}
