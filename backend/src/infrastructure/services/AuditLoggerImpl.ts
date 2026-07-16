import { IAuditLogger } from '../../domain/ports/IAuditLogger';
import { AuditLogRepository } from '../../domain/repositories/AuditLogRepository';
import { CreateAuditLogData } from '../../domain/entities/AuditLog';
import { wsManager } from '../websocket/WebSocketManager';

export class AuditLoggerImpl implements IAuditLogger {
  constructor(private auditLogRepo: AuditLogRepository) {}

  log(data: CreateAuditLogData): void {
    this.auditLogRepo.create(data).then((log) => {
      wsManager.broadcast('new-audit-log', {
        id: log.id,
        userId: log.userId,
        userEmail: log.userEmail,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        createdAt: log.createdAt,
      });
    }).catch(() => {});
  }
}
