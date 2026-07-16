import { useState, useEffect } from 'react';
import { container } from '../../../../di/container';
import type { ContactMessage } from '../../../../domain/entities/ContactMessage';

export default function ContactMessageTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    container.contact.getAll().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    await container.contact.markAsRead(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const filtered = messages.filter(m => {
    const matchesSearch = !searchTerm || 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'unread' && !m.isRead) || (filterStatus === 'read' && m.isRead);
    const msgDate = new Date(m.createdAt);
    const matchesDateFrom = !dateFrom || msgDate >= new Date(dateFrom + 'T00:00:00');
    const matchesDateTo = !dateTo || msgDate <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const unread = filtered.filter(m => !m.isRead);
  const read = filtered.filter(m => m.isRead);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Mensajes de Contacto</h2>

      {!viewing && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Nombre, email, asunto o mensaje..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white">
              <option value="all">Todos</option>
              <option value="unread">No leídos</option>
              <option value="read">Leídos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          {(searchTerm || filterStatus !== 'all' || dateFrom || dateTo) && (
            <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); setDateFrom(''); setDateTo(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Limpiar</button>
          )}
        </div>
      )}

      {viewing ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <button onClick={() => setViewing(null)} className="text-sm text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{viewing.subject || 'Sin asunto'}</h3>
              <p className="text-sm text-gray-500">{viewing.name} &lt;{viewing.email}&gt;</p>
              {viewing.phone && <p className="text-sm text-gray-400">{viewing.phone}</p>}
            </div>
            <span className="text-xs text-gray-400">{new Date(viewing.createdAt).toLocaleString()}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewing.message}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <a href={`mailto:${viewing.email}?subject=${encodeURIComponent('Re: ' + (viewing.subject || 'Consulta desde la web'))}&body=${encodeURIComponent('\n\n--- Mensaje original de ' + viewing.name + ' ---\n' + viewing.message)}`}
              className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Responder por Email
            </a>
            {!viewing.isRead && (
              <button onClick={() => { markAsRead(viewing.id); setViewing({ ...viewing, isRead: true }); }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Marcar como leído</button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {unread.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">No leídos ({unread.length})</h3>
              {unread.map(m => <MessageCard key={m.id} message={m} onClick={() => { setViewing(m); if (!m.isRead) markAsRead(m.id); }} />)}
            </div>
          )}
          {read.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Leídos ({read.length})</h3>
              {read.map(m => <MessageCard key={m.id} message={m} onClick={() => setViewing(m)} />)}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <p className="text-sm font-medium">{messages.length === 0 ? 'No hay mensajes' : 'No se encontraron mensajes con esos filtros'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageCard({ message, onClick }: { message: ContactMessage; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!message.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
            <span className="font-medium text-sm text-gray-800 truncate">{message.name}</span>
            {message.subject && <span className="text-xs text-gray-400 truncate">· {message.subject}</span>}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{message.message}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{new Date(message.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
