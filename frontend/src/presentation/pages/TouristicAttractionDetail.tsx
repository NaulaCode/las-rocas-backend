import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { container } from '../../di/container';
import SEO from '../components/SEO';
import type { TouristicAttraction } from '../../domain/entities/TouristicAttraction';
import type { Organization } from '../../domain/entities/Organization';
import ImageLightbox from '../components/ImageLightbox';

const categoryGradients: Record<string, string> = {
  natural: 'from-green-400 to-emerald-600', cultural: 'from-purple-400 to-indigo-600',
  aventura: 'from-orange-400 to-red-500', gastronomico: 'from-yellow-400 to-orange-500',
  historico: 'from-amber-600 to-yellow-700', playa: 'from-sky-400 to-cyan-500',
  montana: 'from-teal-500 to-green-600',
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TouristicAttractionDetail() {
  const { t } = useTranslation();

  const categoryLabels: Record<string, string> = {
    natural: t('attractions.natural'), cultural: t('attractions.cultural'), aventura: t('attractions.aventura'),
    gastronomico: t('attractions.gastronomico'), historico: t('attractions.historico'), playa: t('attractions.playa'),
    montana: t('attractions.montana'), otro: t('attractions.otro'),
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<TouristicAttraction | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const whatsapp = org?.pageContent?.contacto?.whatsappNumber || '593999999999';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      container.attractions.getById(id),
      container.organization.get(),
    ])
      .then(([attractionData, orgData]) => {
        setAttraction(attractionData);
        setOrg(orgData);
      })
      .catch(() => navigate('/atractivos'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500">{t('common.cargando')}</p>
        </div>
      </div>
    );
  }

  if (!attraction) return null;

  const images = attraction.image
    ? [{ url: attraction.image, caption: attraction.name }]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={attraction.name} description={attraction.description} />
      <div className={`relative bg-gradient-to-br ${categoryGradients[attraction.category] || 'from-emerald-600 to-teal-500'} py-16 md:py-20 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/atractivos" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('attractionDetail.volver')}
          </Link>
          <motion.div initial="hidden" animate="visible" variants={itemAnim}>
            <span className="inline-block text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
              {categoryLabels[attraction.category] || attraction.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{attraction.name}</h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {attraction.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(0)}
              >
                <img src={attraction.image} alt={attraction.name} className="w-full h-80 md:h-96 object-cover hover:scale-105 transition-transform duration-500" />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('attractionDetail.descripcion')}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{attraction.description}</p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
            >
              <h3 className="font-bold text-gray-800 text-lg">{t('attractionDetail.detalles')}</h3>
              <div className="space-y-3">
                {attraction.price && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('attractionDetail.precio')}</p>
                      <p className="font-semibold text-gray-800">S/ {attraction.price}</p>
                    </div>
                  </div>
                )}
                {attraction.duration && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('attractionDetail.duracion')}</p>
                      <p className="font-semibold text-gray-800">{attraction.duration}</p>
                    </div>
                  </div>
                )}
                {attraction.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('attractionDetail.ubicacion')}</p>
                      <p className="font-semibold text-gray-800">{attraction.location}</p>
                    </div>
                  </div>
                )}
                {attraction.schedule && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('attractionDetail.horario')}</p>
                      <p className="font-semibold text-gray-800">{attraction.schedule}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="font-bold text-lg mb-2">{t('attractionDetail.teInteresa')}</h3>
              <p className="text-emerald-100 text-sm mb-4">{t('attractionDetail.contactanos')}</p>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t('attractionDetail.consultaMsg', { nombre: attraction.name }))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-white text-emerald-700 font-semibold py-3 px-4 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('attractionDetail.consultarWA')}
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((prev) => prev === null ? 0 : (prev - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((prev) => prev === null ? 0 : (prev + 1) % images.length)}
        />
      )}
    </div>
  );
}
