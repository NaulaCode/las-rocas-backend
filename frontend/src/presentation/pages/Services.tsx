import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import { container } from '../../di/container';
import type { TouristicService } from '../../domain/entities/TouristicService';
import type { Organization } from '../../domain/entities/Organization';
import AnimatedPrice from '../components/AnimatedPrice';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const defaultGradients: Record<string, string> = {
  hospedaje: 'from-blue-400 to-blue-600',
  aventura: 'from-green-400 to-emerald-600',
  restaurante: 'from-red-400 to-red-600',
  cultura: 'from-purple-400 to-indigo-600',
  gastronomia: 'from-yellow-400 to-orange-500',
  transporte: 'from-cyan-400 to-blue-500',
  paquete: 'from-pink-400 to-rose-600',
  piscinas: 'from-sky-400 to-teal-500',
  otro: 'from-gray-400 to-gray-600',
};

export default function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const defaultCategories = [
    { value: 'all', label: t('services.todos') },
    { value: 'aventura', label: t('services.aventura') },
    { value: 'hospedaje', label: t('services.hospedaje') },
    { value: 'restaurante', label: t('services.restaurante') },
    { value: 'gastronomia', label: t('services.gastronomia') },
    { value: 'cultura', label: t('services.cultura') },
    { value: 'transporte', label: t('services.transporte') },
    { value: 'paquete', label: t('services.paquetes') },
    { value: 'piscinas', label: t('services.piscinas') },
    { value: 'otro', label: t('services.otro') },
  ];
  const [services, setServices] = useState<TouristicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [org, setOrg] = useState<Organization | null>(null);
  const [starRatings, setStarRatings] = useState<Record<string, number>>({});

  const categoryGradients: Record<string, string> = { ...defaultGradients };
  (org?.pageContent?.categories || []).forEach((c) => {
    if (c.name && c.gradient) categoryGradients[c.name] = c.gradient;
  });

  const categories = useMemo(() => {
    const cats = org?.pageContent?.categories;
    if (!cats || cats.length === 0) return defaultCategories;
    return [
      { value: 'all', label: t('services.todos') },
      ...cats.map((c) => ({ value: c.name, label: c.label || c.name })),
    ];
  }, [org]);

  useEffect(() => {
    container.organization.get().then((o) => {
      setOrg(o);
      const reviews = o?.pageContent?.reviews?.filter(r => r.approved) || [];
      const ratings: Record<string, { sum: number; count: number }> = {};
      reviews.forEach(r => {
        if (r.serviceName) {
          if (!ratings[r.serviceName]) ratings[r.serviceName] = { sum: 0, count: 0 };
          ratings[r.serviceName].sum += r.rating;
          ratings[r.serviceName].count += 1;
        }
      });
      const avg: Record<string, number> = {};
      Object.entries(ratings).forEach(([k, v]) => { avg[k] = Math.round((v.sum / v.count) * 10) / 10; });
      setStarRatings(avg);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const fetch = selectedCategory === 'all'
      ? container.services.getAllActive()
      : container.services.getByCategory(selectedCategory);
    fetch.then(setServices).catch(() => setServices([])).finally(() => setLoading(false));
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = services;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t) ||
        (s.location || '').toLowerCase().includes(t)
      );
    }
    return result;
  }, [services, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, totalPages || 1);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO title={t('services.titulo')} description={t('services.subtitulo')} />
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('services.titulo')}
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            {t('services.subtitulo')}
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
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 bg-gray-50 text-sm"
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
                backgroundColor: selectedCategory === cat.value ? '#334e68' : '#ffffff',
                color: selectedCategory === cat.value ? '#ffffff' : '#4b5563',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
               className={`px-5 py-3 rounded-full font-medium text-sm shadow-sm ${
                selectedCategory === cat.value ? 'shadow-lg shadow-primary-600/30' : ''
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
                {t('services.resultados', { count: filtered.length })} &quot;<strong>{searchTerm}</strong>&quot;
              </p>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paged.map((service, idx) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative cursor-pointer"
                  onClick={() => navigate(`/servicios/${service.id}`)}
                >
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500"
                  />
                  <div className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group-hover:border-transparent border border-gray-100">
                    <div className="relative h-48 overflow-hidden">
                      {service.image ? (
                        <SafeImage src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[service.category] || 'from-primary-400 to-primary-600'} flex items-center justify-center`}>
                          <span className="text-5xl font-bold text-white/20">{service.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider bg-primary-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      {service.price && (
                        <div className="absolute top-3 right-3 bg-accent-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          <AnimatedPrice value={service.price!} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1 text-gray-800 group-hover:text-primary-700 transition-colors">{service.name}</h3>
                      {starRatings[service.name] && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(starRatings[service.name]) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{starRatings[service.name]}</span>
                        </div>
                      )}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
                        {service.duration && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {service.duration}
                          </span>
                        )}
                        {service.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {service.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Pagination current={safePage} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </motion.div>
        ) : (
          <EmptyState
            variant="services"
            title={t('services.sinResultados')}
            description={searchTerm ? t('services.sinResultadosSearch', { searchTerm }) : t('services.sinResultadosDesc')}
            action={searchTerm || selectedCategory !== 'all' ? { label: t('services.verTodos'), onClick: () => { setSearchTerm(''); setSelectedCategory('all'); } } : undefined}
          />
        )}
      </div>
    </div>
  );
}
