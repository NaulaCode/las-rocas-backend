import { Request, Response, NextFunction } from 'express';
import { AuditUseCases } from '../../../application/use-cases/AuditUseCases';

export class AuditController {
  constructor(private auditUseCases: AuditUseCases) {}

  async getLogs(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, action, entityType, startDate, endDate, limit, offset } = req.query;
      const logs = await this.auditUseCases.getAll({
        userId, action, entityType, startDate, endDate,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      const total = await this.auditUseCases.count({
        userId, action, entityType, startDate, endDate,
      });
      res.json({ status: 'success', data: logs, total });
    } catch (error) {
      next(error);
    }
  }
}
