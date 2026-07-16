import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { container } from '../../di/container';
import type { TouristicAttraction } from '../../domain/entities/TouristicAttraction';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const categoryGradients: Record<string, string> = {
  natural: 'from-green-400 to-emerald-600',
  cultural: 'from-purple-400 to-indigo-600',
  aventura: 'from-orange-400 to-red-500',
  gastronomico: 'from-yellow-400 to-orange-500',
  historico: 'from-amber-600 to-yellow-700',
  playa: 'from-sky-400 to-cyan-500',
  montana: 'from-teal-500 to-green-600',
};

export default function TouristicAttractions() {
  const { t } = useTranslation();

  const categoryLabels: Record<string, string> = {
    natural: t('attractions.natural'),
    cultural: t('attractions.cultural'),
    aventura: t('attractions.aventura'),
    gastronomico: t('attractions.gastronomico'),
    historico: t('attractions.historico'),
    playa: t('attractions.playa'),
    montana: t('attractions.montana'),
    otro: t('attractions.otro'),
  };

  const categories = [
    { value: 'all', label: t('attractions.todos') },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
  ];

  const [attractions, setAttractions] = useState<TouristicAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const fetch = selectedCategory === 'all'
      ? container.attractions.getAllActive()
      : container.attractions.getByCategory(selectedCategory);
    fetch.then(setAttractions).catch(() => setAttractions([])).finally(() => setLoading(false));
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = attractions;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((a) =>
        a.name.toLowerCase().includes(t) ||
        a.description.toLowerCase().includes(t) ||
        (a.location || '').toLowerCase().includes(t)
      );
    }
    return result;
  }, [attractions, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, totalPages || 1);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO title={t('attractions.titulo')} description={t('attractions.seoDescripcion')} />
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('attractions.titulo')}
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            {t('attractions.subtitulo')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('common.buscar')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <motion.button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: selectedCategory === cat.value ? '#059669' : '#ffffff',
                color: selectedCategory === cat.value ? '#ffffff' : '#4b5563',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
               className={`px-5 py-3 rounded-full font-medium text-sm shadow-sm ${
                selectedCategory === cat.value ? 'shadow-lg shadow-emerald-600/30' : ''
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            {searchTerm && (
              <p className="text-gray-500 mb-4 text-sm">
                {t('attractions.resultados', { count: filtered.length })} "<strong>{searchTerm}</strong>"
              </p>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paged.map((attraction, idx) => (
                <motion.div
                  key={attraction.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative"
                >
                  <motion.div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500" />
                  <Link to={`/atractivos/${attraction.id}`} className="block relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    <div className="relative h-48 overflow-hidden">
                      {attraction.image ? (
                        <img src={attraction.image} alt={attraction.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[attraction.category] || 'from-emerald-400 to-emerald-600'} flex items-center justify-center`}>
                          <span className="text-5xl font-bold text-white/20">{attraction.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider bg-emerald-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {categoryLabels[attraction.category] || attraction.category}
                        </span>
                      </div>
                      {attraction.price && (
                        <div className="absolute top-3 right-3 bg-accent-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          S/ {attraction.price}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-emerald-700 transition-colors">{attraction.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{attraction.description}</p>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
                        {attraction.duration && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {attraction.duration}
                          </span>
                        )}
                        {attraction.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {attraction.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <Pagination current={safePage} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </motion.div>
        ) : (
          <EmptyState
            variant="services"
            title={t('attractions.sinResultados')}
            description={searchTerm ? t('attractions.sinResultadosSearch', { searchTerm }) : t('attractions.sinResultadosDesc')}
            action={searchTerm || selectedCategory !== 'all' ? { label: t('attractions.verTodos'), onClick: () => { setSearchTerm(''); setSelectedCategory('all'); } } : undefined}
          />
        )}
      </div>
    </div>
  );
}
