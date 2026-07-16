import { AuditLog, CreateAuditLogData } from '../../domain/entities/AuditLog';
import { AuditLogRepository, AuditLogFilters } from '../../domain/repositories/AuditLogRepository';

export class AuditUseCases {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async log(data: CreateAuditLogData): Promise<AuditLog> {
    return this.auditLogRepository.create(data);
  }

  async getAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    return this.auditLogRepository.findAll(filters);
  }

  async count(filters?: AuditLogFilters): Promise<number> {
    return this.auditLogRepository.count(filters);
  }
}
