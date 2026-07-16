import { AuditLog, CreateAuditLogData } from '../entities/AuditLog';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLog>;
  findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;
  count(filters?: AuditLogFilters): Promise<number>;
}
