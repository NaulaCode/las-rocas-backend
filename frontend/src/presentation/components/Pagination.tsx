interface Props {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className="px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600"
        aria-label="Página anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
              p === current
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        className="px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600"
        aria-label="Página siguiente"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
