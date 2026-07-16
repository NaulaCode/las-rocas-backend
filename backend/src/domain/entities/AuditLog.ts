export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: Date;
}

export interface CreateAuditLogData {
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
}
