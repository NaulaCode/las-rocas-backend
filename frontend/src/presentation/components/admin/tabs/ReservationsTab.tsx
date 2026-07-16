import { useState } from 'react';
import { Reservation } from '../../../../domain/entities/Reservation';
import { TouristicService } from '../../../../domain/entities/TouristicService';
import { renderTable, actionButtons, searchInput, sortData } from '../AdminTable';
import StatusBadge from '../StatusBadge';
import Pagination from '../../Pagination';
import { exportReservationsPDF } from '../../../utils/pdf';
import Modal from '../Modal';

interface Props {
  reservations: Reservation[];
  services: TouristicService[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  openCreate: (type: string) => void;
  openEdit: (type: string, item: any) => void;
  setDeleteId: (id: string | null) => void;
  updateReservationStatus: (id: string, status: string) => void;
}

const PAGE_SIZE = 10;

export default function ReservationsTab({
  reservations, services, searchTerm, setSearchTerm, filterValue, setFilterValue,
  startDate, setStartDate, endDate, setEndDate, serviceFilter, setServiceFilter,
  openCreate, openEdit, setDeleteId, updateReservationStatus
}: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('preferredDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const filtered = reservations.filter((r) => {
    const query = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || r.userName.toLowerCase().includes(query) || r.userEmail.toLowerCase().includes(query);
    const matchStatus = !filterValue || r.status === filterValue;
    const matchService = !serviceFilter || r.serviceId === serviceFilter;
    const matchDate = (!startDate || !r.preferredDate || r.preferredDate >= startDate) && (!endDate || !r.preferredDate || r.preferredDate <= endDate);
    return matchSearch && matchStatus && matchService && matchDate;
  });

  const sorted = sortData(filtered, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(r => r.id)));
  };

  const batchAction = (status: string) => {
    selectedIds.forEach(id => updateReservationStatus(id, status));
    setSelectedIds(new Set());
  };

  const allSelected = paginated.length > 0 && selectedIds.size === paginated.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">{searchInput(searchTerm, setSearchTerm, 'Buscar cliente o email...')}</div>
          <select value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
            <option value="">Todos los estados</option>
            {['pendiente', 'confirmada', 'cancelada', 'completada'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={serviceFilter} onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
            <option value="">Todos los servicios</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white" />
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportReservationsPDF(filtered, services)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Exportar PDF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => openCreate('reservation')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nueva Reserva
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-primary-50 rounded-lg border border-primary-100">
          <span className="text-sm font-medium text-primary-700">{selectedIds.size} seleccionada(s)</span>
          <div className="h-4 w-px bg-primary-200 mx-1" />
          <button onClick={() => batchAction('confirmada')} className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Confirmar</button>
          <button onClick={() => batchAction('completada')} className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">Completar</button>
          <button onClick={() => batchAction('cancelada')} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Cancelar</button>
        </div>
      )}

      {renderTable(
        [
          { label: <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />, key: 'select' },
          { label: 'Cliente', key: 'userName', sortable: true },
          { label: 'Email', key: 'userEmail', sortable: true },
          { label: 'Servicio', key: 'serviceName', sortable: true },
          { label: 'Fecha', key: 'preferredDate', sortable: true },
          { label: 'Estado', key: 'status', sortable: true },
          { label: 'Acciones' }
        ],
        paginated.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3">
              <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
            </td>
            <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.userName}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.userEmail}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.serviceName}</td>
            <td className="px-4 py-3 text-sm text-gray-500">
              {r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-3">
              <select value={r.status} onChange={(e) => updateReservationStatus(r.id, e.target.value)}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${
                  r.status === 'confirmada' ? 'bg-blue-50 text-blue-700' :
                  r.status === 'pendiente' ? 'bg-yellow-50 text-yellow-700' :
                  r.status === 'cancelada' ? 'bg-red-50 text-red-700' :
                  'bg-green-50 text-green-700'
                }`}>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                {(r.status === 'pendiente' || r.status === 'confirmada') && (
                  <button onClick={() => setCancelTarget(r.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar reserva">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {actionButtons(() => openEdit('reservation', r), () => setDeleteId(`reservation:${r.id}`))}
              </div>
            </td>
          </tr>
        )),
        { key: sortKey, dir: sortDir },
        handleSort
      )}
      {totalPages > 1 && <Pagination current={page} total={sorted.length} pageSize={PAGE_SIZE} onChange={setPage} />}

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} onSave={async () => { if (cancelTarget) { updateReservationStatus(cancelTarget, 'cancelada'); setCancelTarget(null); } }} title="Cancelar Reserva" submitLabel="Sí, cancelar">
        <p className="text-sm text-gray-600">¿Estás seguro de cancelar esta reserva?</p>
      </Modal>
    </div>
  );
}
