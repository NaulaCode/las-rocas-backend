import { CreateAuditLogData } from '../entities/AuditLog';

export interface IAuditLogger {
  log(data: CreateAuditLogData): void;
}
