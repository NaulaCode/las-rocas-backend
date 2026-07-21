interface SortConfig {
  key: string;
  dir: 'asc' | 'desc';
}

interface HeaderDef {
  label: React.ReactNode;
  key?: string;
  sortable?: boolean;
}

export function renderTable(headers: (string | HeaderDef)[], rows: React.ReactNode[], sort?: SortConfig, onSort?: (key: string) => void) {
  const resolvedHeaders: HeaderDef[] = headers.map(h => typeof h === 'string' ? { label: h } : h);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {resolvedHeaders.map((h, i) => (
                <th key={i}
                  onClick={h.sortable && onSort ? () => onSort(h.key!) : undefined}
                  className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === resolvedHeaders.length - 1 ? 'text-center' : 'text-left'} ${h.sortable && onSort ? 'cursor-pointer select-none hover:bg-gray-100/50' : ''}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {h.label}
                    {h.sortable && sort && sort.key === h.key && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sort.dir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length > 0 ? rows : (
              <tr>
                <td colSpan={resolvedHeaders.length} className="px-5 py-16 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm font-medium">No hay datos</p>
                  <p className="text-xs mt-1">Los elementos aparecerán aquí cuando sean creados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function actionButtons(onEdit: () => void, onDelete: () => void) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={onEdit} className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors" title="Editar">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export function sortData<T>(data: T[], key: string, dir: 'asc' | 'desc'): T[] {
  return [...data].sort((a: any, b: any) => {
    const valA = a[key] ?? '';
    const valB = b[key] ?? '';
    const cmp = typeof valA === 'number' ? valA - valB : String(valA).localeCompare(String(valB), 'es');
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function searchInput(value: string, onChange: (v: string) => void, placeholder: string) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
      />
    </div>
  );
}
