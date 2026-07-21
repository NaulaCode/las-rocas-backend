import { useState } from 'react';
import { TouristicService } from '../../../../domain/entities/TouristicService';
import { PageContent } from '../../../../domain/entities/Organization';
import { renderTable, actionButtons, searchInput, sortData } from '../AdminTable';
import StatusBadge from '../StatusBadge';
import Pagination from '../../Pagination';
import ImageLightbox from '../../ImageLightbox';
import { exportServicesPDF } from '../../../utils/pdf';

interface Props {
  services: TouristicService[];
  pageContent: PageContent;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  openCreate: (type: string) => void;
  openEdit: (type: string, item: any) => void;
  setDeleteId: (id: string | null) => void;
}

const PAGE_SIZE = 10;

export default function ServicesTab({ services, pageContent, searchTerm, setSearchTerm, filterValue, setFilterValue, openCreate, openEdit, setDeleteId }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const cats = (pageContent.categories?.length ? pageContent.categories as Array<{name: string; label?: string}> : [{name:'aventura'},{name:'hospedaje'},{name:'restaurante'},{name:'gastronomia'},{name:'cultura'},{name:'transporte'},{name:'paquete'},{name:'piscinas'},{name:'otro'}]);

  const filtered = services.filter((s) => {
    const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = !filterValue || s.category === filterValue;
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

  const activos = services.filter((s) => s.isActive).length;
  const inactivos = services.length - activos;

  return (
    <div className="space-y-6">
      {previewImg && <ImageLightbox images={[{ url: previewImg }]} index={0} onClose={() => setPreviewImg(null)} onPrev={() => {}} onNext={() => {}} />}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activos}</p>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-1">Activos</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{inactivos}</p>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">Inactivos</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{cats.length}</p>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">Categorías</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">{searchInput(searchTerm, setSearchTerm, 'Buscar por nombre...')}</div>
          <select value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
            <option value="">Todas las categorías</option>
            {cats.map((c) => <option key={c.name} value={c.name}>{c.label || c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportServicesPDF(filtered)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Exportar PDF">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => openCreate('service')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Servicio
          </button>
        </div>
      </div>

      {renderTable(
        [
          { label: 'Imagen', key: 'image', sortable: true },
          { label: 'Nombre', key: 'name', sortable: true },
          { label: 'Categoría', key: 'category', sortable: true },
          { label: 'Precio', key: 'price', sortable: true },
          { label: 'Estado', key: 'isActive', sortable: true },
          { label: 'Acciones' }
        ],
        paginated.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-5 py-3.5">
              {s.image ? <img src={s.image} alt="" className="w-10 h-10 object-cover rounded-lg cursor-pointer hover:opacity-80" loading="lazy" onClick={() => setPreviewImg(s.image ?? null)} />
                : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>}
            </td>
            <td className="px-5 py-3.5 text-sm font-medium text-gray-800 max-w-0 truncate">{s.name}</td>
            <td className="px-5 py-3.5"><span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{s.category}</span></td>
            <td className="px-5 py-3.5 text-sm text-gray-600">{s.price ? `$${s.price}` : '-'}</td>
            <td className="px-5 py-3.5"><StatusBadge active={s.isActive} status={s.isActive ? 'activo' : 'inactivo'} /></td>
            <td className="px-5 py-3.5">{actionButtons(() => openEdit('service', s), () => setDeleteId(`service:${s.id}`))}</td>
          </tr>
        )),
        { key: sortKey, dir: sortDir },
        handleSort
      )}

      {totalPages > 1 && <div className="pt-2"><Pagination current={page} total={sorted.length} pageSize={PAGE_SIZE} onChange={setPage} /></div>}
    </div>
  );
}
