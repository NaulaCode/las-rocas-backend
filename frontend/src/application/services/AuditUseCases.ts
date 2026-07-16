import { IAuditLogRepository } from '../../domain/ports/IAuditLogRepository';
import { AuditLog, AuditLogFilters } from '../../domain/entities/AuditLog';

export class AuditUseCases {
  constructor(private auditRepo: IAuditLogRepository) {}

  async getLogs(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditRepo.getLogs(filters);
  }
}
