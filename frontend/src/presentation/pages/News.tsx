import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import { container } from '../../di/container';
import type { News, NewsType } from '../../domain/entities/News';
import type { Organization } from '../../domain/entities/Organization';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const typeGradients: Record<string, string> = {
  noticia: 'from-blue-400 to-blue-600',
  evento: 'from-accent-500 to-accent-600',
  festividad: 'from-yellow-400 to-orange-500',
  actividad: 'from-green-400 to-emerald-500',
};



function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function News() {
  const [allNews, setAllNews] = useState<News[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<NewsType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    container.organization.get().then(setOrg).catch(() => {});
  }, []);
  const types: { value: NewsType | 'all'; label: string }[] = [
    { value: 'all', label: t('news.todos') },
    { value: 'noticia', label: t('news.noticia') },
    { value: 'evento', label: t('news.evento') },
    { value: 'festividad', label: t('news.festividad') },
    { value: 'actividad', label: t('news.actividad') },
  ];
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const fetch = selectedType === 'all'
      ? container.news.getAllPublished()
      : container.news.getByType(selectedType);
    fetch.then(setAllNews).catch(() => setAllNews([])).finally(() => setLoading(false));
  }, [selectedType]);

  const filtered = useMemo(() => {
    let result = allNews;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter((n) =>
        n.title.toLowerCase().includes(t) ||
        (n.summary || '').toLowerCase().includes(t) ||
        (n.location || '').toLowerCase().includes(t)
      );
    }
    return result;
  }, [allNews, searchTerm]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, totalPages || 1);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO title={t('news.titulo')} description={t('news.seoDescripcion')} />
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${org?.coverImage || 'https://images.unsplash.com/photo-1504457047772-27faf9c0f3e9?w=1920&h=1080&fit=crop'})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-800/70 to-primary-900/90" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/5 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('news.titulo')}</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            {t('news.subtitulo')}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

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
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
               className={`px-5 py-3 rounded-full font-medium transition-all text-sm ${
                selectedType === type.value
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row animate-pulse">
                <div className="md:w-80 h-56 md:h-auto bg-gray-200" />
                <div className="p-6 flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
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
                {t('news.resultados', { count: filtered.length })} "<strong>{searchTerm}</strong>"
              </p>
            )}
            <div className="space-y-8">
              {paged.map((item, index) => (
                <Link
                  to={`/noticias/${item.id}`}
                  key={item.id}
                  className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col md:flex-row"
                >
                  <div className={`md:w-80 h-56 md:h-auto relative overflow-hidden ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                    {item.image ? (
                      <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${typeGradients[item.type] || 'from-primary-400 to-primary-600'} flex items-center justify-center`}>
                        <span className="text-7xl font-bold text-white/20">{item.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold text-white uppercase tracking-wider bg-primary-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    {item.eventDate && (
                      <p className="text-sm text-accent-600 font-medium mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(item.eventDate)}
                      </p>
                    )}
                    <h3 className="font-bold text-xl text-gray-800 mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed line-clamp-3">{item.summary || item.content}</p>
                    {item.location && (
                      <p className="text-gray-400 text-sm mt-4 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination current={safePage} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </motion.div>
        ) : (
          <EmptyState
            variant="news"
            title={t('news.sinResultados')}
            description={searchTerm ? `${t('common.noResultados')} "${searchTerm}"` : t('news.sinResultadosDesc')}
            action={searchTerm || selectedType !== 'all' ? { label: t('news.verTodo'), onClick: () => { setSearchTerm(''); setSelectedType('all'); } } : undefined}
          />
        )}
      </div>


    </div>
  );
}
