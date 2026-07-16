export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}
