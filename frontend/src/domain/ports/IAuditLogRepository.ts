import { AuditLog, AuditLogFilters } from '../entities/AuditLog';

export interface IAuditLogRepository {
  getLogs(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; total: number }>;
}
