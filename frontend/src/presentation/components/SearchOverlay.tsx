import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { container } from '../../di/container';
import type { TouristicService } from '../../domain/entities/TouristicService';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TouristicService[]>([]);
  const [allServices, setAllServices] = useState<TouristicService[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 100);
    container.services.getAllActive().then(setAllServices).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = allServices.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 8));
  }, [query, allServices]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const select = useCallback((id: string) => {
    onClose();
    navigate(`/servicios/${id}`);
  }, [onClose, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 text-lg outline-none placeholder-gray-300"
              />
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => select(r.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {r.image ? (
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                          {r.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{r.name}</p>
                      <p className="text-sm text-gray-400 truncate">{r.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{r.category}</span>
                  </button>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{t('search.noResults', { query })}</p>
              </div>
            )}
            {!query && (
              <div className="p-6 text-center text-gray-400">
                <p className="text-sm">{t('search.empty')}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
