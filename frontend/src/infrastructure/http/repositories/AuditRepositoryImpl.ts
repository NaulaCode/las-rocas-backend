import { IAuditLogRepository } from '../../../domain/ports/IAuditLogRepository';
import { AuditLog, AuditLogFilters } from '../../../domain/entities/AuditLog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class AuditRepositoryImpl implements IAuditLogRepository {
  async getLogs(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.action) params.set('action', filters.action);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.offset) params.set('offset', String(filters.offset));

    const res = await fetch(`${API_URL}/audit?${params.toString()}`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener logs');
    return json;
  }
}
