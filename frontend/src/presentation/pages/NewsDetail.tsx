import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { container } from '../../di/container';
import DetailLayout from '../components/DetailLayout';
import type { News } from '../../domain/entities/News';

const typeGradients: Record<string, string> = {
  noticia: 'from-blue-400 to-blue-600',
  evento: 'from-accent-500 to-accent-600',
  festividad: 'from-yellow-400 to-orange-500',
  actividad: 'from-green-400 to-emerald-500',
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-EC', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    container.news.getById(id)
      .then(setItem)
      .catch(() => navigate('/noticias'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <DetailLayout loading title="Cargando..." children={null} />;
  if (!item) return null;

  return (
    <DetailLayout
      loading={loading}
      seoTitle={item.title}
      seoDescription={item.summary || item.content}
      gradient={typeGradients[item.type] || 'from-primary-600 to-accent-600'}
      badge={item.type}
      title={item.title}
      subtitle={item.eventDate ? (
        <p className="text-white/80 flex items-center gap-2 mt-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(item.eventDate)}
        </p>
      ) : undefined}
      backTo={{ path: '/noticias', label: t('newsDetail.volver') }}
      narrow
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {item.image && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        <div className="p-6 md:p-10">
          {item.summary && (
            <p className="text-lg text-gray-500 italic mb-6 border-l-4 border-primary-300 pl-4">{item.summary}</p>
          )}
          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
            {item.content}
          </div>
          {item.location && (
            <p className="text-gray-400 text-sm mt-8 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.location}
            </p>
          )}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100">
            <span className="text-sm text-gray-400 mr-1">{t('newsDetail.compartir')}:</span>
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${item.title} - ${window.location.href}`)}`, '_blank')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title={t('common.whatsapp')} aria-label={t('common.compartirWhatsApp')}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </button>
            <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title={t('common.facebook')} aria-label={t('common.compartirFacebook')}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title={t('common.copiarEnlace')} aria-label={t('common.copiarEnlace')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DetailLayout>
  );
}
