import { Request, Response, NextFunction } from 'express';
import { OrganizationUseCases } from '../../../application/use-cases/OrganizationUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class OrganizationController {
  constructor(
    private organizationUseCases: OrganizationUseCases,
    private auditLogger: IAuditLogger,
  ) {}

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await this.organizationUseCases.get();
      res.status(200).json({ status: 'success', data: org });
    } catch (error) { next(error); }
  }

  async update(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await this.organizationUseCases.update(req.body);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'organization', entityId: '00000000-0000-0000-0000-000000000001' });
      res.status(200).json({ status: 'success', message: 'Información actualizada correctamente', data: org });
    } catch (error) { next(error); }
  }
}
