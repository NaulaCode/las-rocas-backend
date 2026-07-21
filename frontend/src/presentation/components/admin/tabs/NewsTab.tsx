import { useState } from 'react';
import { News } from '../../../../domain/entities/News';
import { renderTable, actionButtons, searchInput, sortData } from '../AdminTable';
import StatusBadge from '../StatusBadge';
import Pagination from '../../Pagination';
import ImageLightbox from '../../ImageLightbox';
import { exportNewsPDF } from '../../../utils/pdf';

interface Props {
  news: News[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  openCreate: (type: string) => void;
  openEdit: (type: string, item: any) => void;
  setDeleteId: (id: string | null) => void;
}

const PAGE_SIZE = 10;

export default function NewsTab({ news, searchTerm, setSearchTerm, filterValue, setFilterValue, openCreate, openEdit, setDeleteId }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const filtered = news.filter((n) => {
    const matchSearch = !searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = !filterValue || n.type === filterValue;
    return matchSearch && matchFilter;
  });

  const sorted = sortData(filtered, sortKey, sortDir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const published = news.filter((n) => n.isPublished).length;
  const drafts = news.length - published;
  const types = [...new Set(news.map((n) => n.type))];

  return (
    <div className="space-y-6">
      {previewImg && <ImageLightbox images={[{ url: previewImg }]} index={0} onClose={() => setPreviewImg(null)} onPrev={() => {}} onNext={() => {}} />}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{published}</p>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-1">Publicadas</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{drafts}</p>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-1">Borradores</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{types.length}</p>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">Tipos</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">{searchInput(searchTerm, setSearchTerm, 'Buscar por título...')}</div>
          <select value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
            <option value="">Todos los tipos</option>
            {['noticia', 'evento', 'festividad', 'actividad'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportNewsPDF(filtered)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Exportar PDF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => openCreate('news')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nueva Noticia
          </button>
        </div>
      </div>

      {renderTable(
        [
          { label: 'Imagen', key: 'image', sortable: true },
          { label: 'Título', key: 'title', sortable: true },
          { label: 'Tipo', key: 'type', sortable: true },
          { label: 'Estado', key: 'isPublished', sortable: true },
          { label: 'Acciones' }
        ],
        paginated.map((n) => (
          <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-5 py-3.5">
              {n.image ? <img src={n.image} alt="" className="w-10 h-10 object-cover rounded-lg cursor-pointer hover:opacity-80" loading="lazy" onClick={() => setPreviewImg(n.image ?? null)} />
                : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg></div>}
            </td>
            <td className="px-5 py-3.5 text-sm font-medium text-gray-800 max-w-0 truncate">{n.title}</td>
            <td className="px-5 py-3.5"><span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{n.type}</span></td>
            <td className="px-5 py-3.5"><StatusBadge status={n.isPublished ? 'publicado' : 'borrador'} /></td>
            <td className="px-5 py-3.5">{actionButtons(() => openEdit('news', n), () => setDeleteId(`news:${n.id}`))}</td>
          </tr>
        )),
        { key: sortKey, dir: sortDir },
        handleSort
      )}

      {totalPages > 1 && <div className="pt-2"><Pagination current={page} total={sorted.length} pageSize={PAGE_SIZE} onChange={setPage} /></div>}
    </div>
  );
}
