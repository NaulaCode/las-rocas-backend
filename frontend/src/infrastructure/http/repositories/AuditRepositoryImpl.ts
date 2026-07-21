import { IAuditLogRepository } from '../../../domain/ports/IAuditLogRepository';
import { AuditLog, AuditLogFilters } from '../../../domain/entities/AuditLog';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'https://las-rocas-backend.onrender.com/api/v1'
    : '/api/v1'
);

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export class AuditRepositoryImpl implements IAuditLogRepository {
  async getLogs(filters?: AuditLogFilters): Promise<{ data: AuditLog[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.action) params.set('action', filters.action);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.offset) params.set('offset', String(filters.offset));

    const res = await fetch(`${API_URL}/audit?${params.toString()}`, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener logs');
    return json;
  }
}
