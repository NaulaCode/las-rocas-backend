import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { container as di } from '../../di/container';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import ImageLightbox from '../components/ImageLightbox';
import { Organization } from '../../domain/entities/Organization';
import EmptyState from '../components/EmptyState';

const galleryContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Galeria() {
  const { t } = useTranslation();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const gallery: { url: string; caption?: string; type?: string }[] = org?.pageContent?.gallery || [];

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url);

  const isYouTubeUrl = (url: string) =>
    /youtube\.com|youtu\.be/i.test(url);

  const isVideo = (entry: { url: string; type?: string }) =>
    entry.type === 'video' || entry.type === 'youtube' || isVideoUrl(entry.url) || isYouTubeUrl(entry.url);

  const isYouTube = (entry: { url: string; type?: string }) =>
    entry.type === 'youtube' || isYouTubeUrl(entry.url);

  const getEmbedUrl = (url: string) =>
    url.includes('watch?v=')
      ? url.replace('watch?v=', 'embed/').split('&')[0]
      : url.includes('youtu.be/')
        ? url.replace('youtu.be/', 'www.youtube.com/embed/')
        : url;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    di.organization.get()
      .then(setOrg)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${t('galeria.titulo')} - Asociación Turística Las Rocas`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${t('galeria.titulo')} - Asociación Turística Las Rocas - ${window.location.href}`)}`, '_blank');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-64 bg-gradient-to-br from-primary-100 to-gray-100 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="break-inside-avoid bg-gray-200 rounded-2xl animate-pulse" style={{ height: `${200 + i * 40}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO title={t('galeria.titulo')} description={t('galeria.seoDescripcion')} />
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <motion.div className="absolute top-10 left-20 w-20 h-20 border border-white/10 rounded-full" animate={{ y: [-10, 10, -10] }} transition={{ duration: 7, repeat: Infinity }} />
          <motion.div className="absolute bottom-10 right-32 w-32 h-32 border border-white/5 rounded-full" animate={{ y: [10, -10, 10] }} transition={{ duration: 9, repeat: Infinity }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {t('galeria.titulo')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-primary-100 text-lg max-w-2xl mx-auto"
          >
            {t('galeria.subtitulo')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            <button onClick={shareFacebook} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all" title={t('common.compartirFacebook')}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
            </button>
            <button onClick={shareTwitter} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all" title={t('common.compartirTwitter')}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
            </button>
            <button onClick={shareWhatsApp} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all" title={t('common.compartirWhatsApp')}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-20 pb-16">
        {gallery.length > 0 ? (
          <motion.div
            variants={galleryContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max"
          >
            {gallery.map((entry, i) => (
              <motion.div
                key={i}
                variants={item}
                className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 ${isVideo(entry) ? 'cursor-pointer' : ''}`}
                onClick={() => !isVideo(entry) && openLightbox(i)}
              >
                <div className="relative overflow-hidden bg-gray-900">
                  {isVideo(entry) ? (
                    isYouTube(entry) ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={getEmbedUrl(entry.url)}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                          title={entry.caption || ''}
                        />
                      </div>
                    ) : (
                      <video
                        src={entry.url}
                        className="w-full h-auto max-h-96 object-contain bg-black"
                        controls
                        playsInline
                        preload="metadata"
                        title={entry.caption || ''}
                      />
                    )
                  ) : (
                    <SafeImage
                      src={entry.url}
                      alt={entry.caption || ''}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        {isVideo(entry) ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  {isVideo(entry) && (
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      {t('galeria.video')}
                    </div>
                  )}
                </div>
                {entry.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-sm font-medium">{entry.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState variant="gallery" title={t('galeria.sinImagenes')} description={t('galeria.sinImagenesDesc')} />
        )}
      </div>

      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="gradient-text">{t('galeria.quieresAparecer')}</span>
            </h2>
            <p className="text-gray-500 mb-6">
              {t('galeria.comparteFotos')}
            </p>
            <div className="flex justify-center gap-3">
              <a href="#" className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all text-sm">
                {t('galeria.hashtag')}
              </a>
              <a href="/contacto" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all text-sm">
                {t('common.contactar')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {lightboxOpen && (
        <ImageLightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % gallery.length)}
        />
      )}
    </div>
  );
}
