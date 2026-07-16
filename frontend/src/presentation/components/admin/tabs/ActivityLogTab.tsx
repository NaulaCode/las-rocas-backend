import { useState, useEffect } from 'react';
import { container } from '../../../../di/container';
import type { AuditLog } from '../../../../domain/entities/AuditLog';

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-700 border-green-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
};

const entityLabels: Record<string, string> = {
  service: 'Servicio',
  news: 'Noticia',
  reservation: 'Reserva',

  user: 'Usuario',
  chatbot_question: 'FAQ Chatbot',
  attraction: 'Atractivo',
  organization: 'Organización',
  contact_message: 'Mensaje',
};

export default function ActivityLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(0);
  const limit = 25;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const filters: any = { limit, offset: page * limit };
      if (filterEntity) filters.entityType = filterEntity;
      if (filterAction) filters.action = filterAction;
      const result = await container.audit.getLogs(filters);
      setLogs(result.data);
      setTotal(result.total);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, [page, filterEntity, filterAction]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Registro de Actividades</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{total} registros</span>
          <button onClick={loadLogs} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400">
          <option value="">Todas las entidades</option>
          {Object.entries(entityLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400">
          <option value="">Todas las acciones</option>
          <option value="CREATE">Crear</option>
          <option value="UPDATE">Actualizar</option>
          <option value="DELETE">Eliminar</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-sm font-medium">No hay registros de actividad</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Acción', 'Entidad', 'Usuario', 'Fecha', 'Detalles'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${actionColors[log.action] || 'bg-gray-50 text-gray-600'}`}>
                        {log.action === 'CREATE' ? 'Creación' : log.action === 'UPDATE' ? 'Actualización' : 'Eliminación'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entityLabels[log.entityType] || log.entityType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.userEmail}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                      {log.details?.changes ? `Cambios: ${log.details.changes.join(', ')}` : log.details?.status ? `Estado: ${log.details.status}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors">Anterior</button>
          <span className="text-sm text-gray-500">Página {page + 1} de {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors">Siguiente</button>
        </div>
      )}
    </div>
  );
}
