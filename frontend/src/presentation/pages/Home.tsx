import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../di/container';
import type { Organization } from '../../domain/entities/Organization';
import type { TouristicService } from '../../domain/entities/TouristicService';
import type { News } from '../../domain/entities/News';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import ImageLightbox from '../components/ImageLightbox';
import AnimatedPrice from '../components/AnimatedPrice';
import EmptyState from '../components/EmptyState';
import { HeroSkeleton, CardSkeleton, NewsCardSkeleton } from '../components/Skeleton';
import { getYouTubeEmbedUrl } from '../utils/video';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const defaultGradients: Record<string, string> = {
  hospedaje: 'from-blue-400 to-blue-600',
  restaurante: 'from-orange-400 to-red-500',
  aventura: 'from-green-400 to-emerald-600',
  cultura: 'from-purple-400 to-indigo-600',
  gastronomia: 'from-yellow-400 to-orange-500',
  transporte: 'from-cyan-400 to-blue-500',
  paquete: 'from-pink-400 to-rose-600',
  piscinas: 'from-sky-400 to-teal-500',
  otro: 'from-gray-400 to-gray-600',
};

const defaultIcons: Record<string, string> = {
  hospedaje: '🏨', restaurante: '🍽️', aventura: '🏔️', cultura: '🎭',
  gastronomia: '🍜', transporte: '🚌', paquete: '🎁', piscinas: '🏊', otro: '📍',
};

const pageAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const defaultTestimonials = [
  { name: 'María García', text: 'Una experiencia inolvidable. La calidez de la gente y la belleza del lugar superaron todas mis expectativas. Volveré sin dudarlo.', rating: 5, role: 'Turista' },
  { name: 'Carlos Mendoza', text: 'Excelente servicio y atención. Los guías conocen perfectamente la zona y hacen que cada recorrido sea único.', rating: 5, role: 'Visitante frecuente' },
  { name: 'Daniela Rivera', text: 'Recomiendo totalmente los paquetes turísticos. La organización impecable y los precios muy accesibles.', rating: 5, role: 'Familia' },
  { name: 'Adriana Palacios', text: 'Descubrir la Comuna San Miguel fue lo mejor de nuestro viaje. La gastronomía local es espectacular.', rating: 4, role: 'Turista internacional' },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 30;
          const stepVal = value / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += stepVal;
            if (current >= value) {
              setDisplay(value);
              clearInterval(interval);
            } else {
              setDisplay(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-transparent">
      {display}{suffix}
    </div>
  );
}

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ delay }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="w-8 h-0.5 bg-primary-200 rounded-full" />
      <span className="w-2 h-2 bg-accent-500 rounded-full" />
      <span className="w-8 h-0.5 bg-primary-200 rounded-full" />
    </div>
  );
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-EC', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
      {initials}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [org, setOrg] = useState<Organization | null>(null);
  const [services, setServices] = useState<TouristicService[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const touchStartX = useRef(0);

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
  const heroImages: string[] = gallery.map((g) => g.url).slice(0, 5);
  const heroBg = heroImages.length > 0 ? heroImages : [org?.coverImage || 'https://images.unsplash.com/photo-1504457047772-27faf9c0f3e9?w=1920&h=1080&fit=crop'];
  const reviews: { name: string; text: string; rating: number; role?: string }[] = (org?.pageContent?.reviews || []).filter((r) => r.approved);
  const testimonials = reviews.length > 0 ? reviews : defaultTestimonials;

  const categoryGradients: Record<string, string> = { ...defaultGradients };
  const categoryIcons: Record<string, string> = { ...defaultIcons };
  (org?.pageContent?.categories || []).forEach((c) => {
    if (c.name && c.gradient) categoryGradients[c.name] = c.gradient;
    if (c.name && c.icon) categoryIcons[c.name] = c.icon;
  });

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gallery.length < 2 || galleryPaused) return;
    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [gallery.length, galleryPaused]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gallery.length < 2) return;
      if (e.key === 'ArrowLeft') setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      if (e.key === 'ArrowRight') setGalleryIndex((prev) => (prev + 1) % gallery.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gallery.length]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    Promise.all([
      container.organization.get().catch(() => null),
      container.services.getAllActive().catch(() => []),
      container.news.getAllPublished().catch(() => []),
    ]).then(([orgData, servicesData, newsData]) => {
      setOrg(orgData);
      setServices(servicesData.slice(0, 6));
      setNews(newsData.slice(0, 3));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    hero.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => hero.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (loading) {
    return (
      <div>
        <HeroSkeleton />
        <div className="py-20 bg-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
              <div className="h-1 w-24 bg-gray-200 rounded-full mx-auto" />
              <div className="h-6 bg-gray-200 rounded w-full max-w-2xl mx-auto" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          </div>
        </div>
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        </div>
        <div className="py-20 bg-primary-700">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <NewsCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardThemes = [
    { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { bg: 'bg-sky-100', text: 'text-sky-600', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
    { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { bg: 'bg-violet-100', text: 'text-violet-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  const whatsapp = org?.pageContent?.contacto?.whatsappNumber || '593999999999';

  return (
    <div className="relative">
      <motion.div
        className="fixed w-8 h-8 pointer-events-none z-[999] hidden md:block"
        style={{
          left: cursorPos.x - 16,
          top: cursorPos.y - 16,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full rounded-full bg-accent-500/20 border border-accent-500/40" />
      </motion.div>
      <SEO title={t('home.seoTitulo')} description={t('home.seoDescripcion')} />
      <section ref={heroRef} className="relative h-[600px] md:h-[780px] flex items-center justify-center overflow-hidden">
        {org?.pageContent?.home?.heroVideoUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            {isYouTubeUrl(org.pageContent.home.heroVideoUrl) ? (
              <iframe
                src={`${getYouTubeEmbedUrl(org.pageContent.home.heroVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeEmbedUrl(org.pageContent.home.heroVideoUrl)?.split('/').pop()}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className="absolute inset-0 w-[200%] h-[200%] left-[-50%] top-[-50%] pointer-events-none"
                style={{ border: 'none' }}
                allow="autoplay; encrypted-media"
                title={t('home.videoPromocional')}
              />
            ) : (
              <video
                src={org.pageContent.home.heroVideoUrl}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-800/70 to-primary-700/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${heroBg[heroIndex]})`,
                transform: `translate(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -20}px) scale(1.05)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-800/70 to-primary-700/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
        )}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-400/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 right-12 w-20 h-20 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 left-20 w-14 h-14 border border-white/10 rounded-lg"
          />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
          {org?.logo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', damping: 15 }}
              className="mb-6"
            >
              <SafeImage src={org.logo} alt={org?.name || 'Las Rocas'} className="h-24 md:h-32 w-auto mx-auto drop-shadow-2xl" />
            </motion.div>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance"
            >
              {org?.pageContent?.home?.heroTitle || org?.name || 'Descubre la magia natural de Las Rocas'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-10 text-primary-100"
            >
              {org?.pageContent?.home?.heroSubtitle || org?.description || 'Ubicada en la comuna San Miguel, cantón Naranjal, la Asociación Turística Las Rocas te invita a disfrutar de aguas termales, senderos ecológicos, paisajes únicos y la hospitalidad de una comunidad comprometida con el turismo sostenible.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                to={org?.pageContent?.home?.heroCtaLink || '/contacto'}
                className="bg-accent-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-accent-600 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-accent-500/30"
              >
                {org?.pageContent?.home?.heroCtaText || 'Reservar Ahora'}
              </Link>
              <Link
                to={org?.pageContent?.home?.heroCta2Link || '/servicios'}
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {org?.pageContent?.home?.heroCta2Text || 'Explorar Servicios'}
              </Link>
            </motion.div>
          </div>

          {heroImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 mt-10"
            >
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`p-2 flex items-center justify-center rounded-full transition-all duration-500 ${i === heroIndex ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Scroll</span>
            <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-1 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <section className="py-24 bg-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-4">
                {org?.name || 'ASOTURLASROCAS'}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">{org?.pageContent?.home?.aboutTitle || 'Bienvenidos a la Asociación Turística Las Rocas'}</span>
              </h2>
              <SectionDivider />
              <p className="text-gray-600 leading-relaxed mb-4 mt-6">
                {org?.pageContent?.home?.aboutText1 || 'En el corazón de la comuna San Miguel, rodeada por la riqueza natural del cantón Naranjal, se encuentra la Asociación Turística Las Rocas, un destino ideal para quienes buscan relajación, aventura y contacto con la naturaleza.'}
              </p>
              <p className="text-gray-500 leading-relaxed">
                {org?.pageContent?.home?.aboutText2 || 'Aquí podrás disfrutar de aguas termales naturales, recorrer senderos ecológicos, admirar paisajes montañosos y compartir experiencias inolvidables con familiares y amigos. Nuestro compromiso es ofrecer un turismo responsable que contribuya al bienestar de la comunidad y a la conservación del entorno natural. Te invitamos a descubrir un lugar donde la naturaleza, la tranquilidad y la cultura local se unen para brindarte una experiencia única.'}
              </p>
              <div className="flex gap-8 mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <AnimatedCounter value={services.length} />
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{t('home.servicios')}</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <AnimatedCounter value={news.length} />
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{t('home.eventos')}</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <AnimatedCounter value={gallery.length} suffix="+" />
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{t('home.fotos')}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent-100 rounded-2xl -rotate-12 hidden md:block" />
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-500 to-accent-600" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('home.mision')}</h4>
                    <p className="text-xs text-gray-400">{t('home.nuestroProposito')}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{org?.mission || 'Promover el turismo sostenible mediante la oferta de servicios turísticos de calidad.'}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-5 ml-0 md:ml-10 relative z-10 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-500 to-primary-600" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{t('home.vision')}</h4>
                    <p className="text-xs text-gray-400">{t('home.nuestroObjetivo')}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{org?.vision || 'Ser un referente regional en turismo comunitario con excelencia e innovación.'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{org?.pageContent?.home?.whyChooseTitle || '¿Por qué elegir la Asociación Las Rocas?'}</span>
            </h2>
            <SectionDivider />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {org?.pageContent?.home?.whyChooseSubtitle || 'Vive una experiencia diferente'}
            </p>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2">
              {org?.pageContent?.home?.whyChooseDesc || 'Cada visita a Las Rocas es una oportunidad para desconectarte de la rutina y reconectarte con la naturaleza. Nuestro destino ofrece espacios ideales para el descanso, la recreación y el ecoturismo, promoviendo experiencias auténticas en un entorno seguro y acogedor.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(org?.pageContent?.home?.whyChoose || [
              { title: 'Naturaleza', text: 'Disfruta de paisajes rodeados de vegetación, montañas y recursos naturales que convierten cada recorrido en una experiencia inolvidable.' },
              { title: 'Aguas Termales', text: 'Relájate en nuestras piscinas de aguas termales naturales, reconocidas por brindar una experiencia de descanso en un ambiente tranquilo.' },
              { title: 'Turismo Comunitario', text: 'Al visitarnos apoyas el desarrollo de la comunidad local, impulsando el turismo sostenible y fortaleciendo la economía de las familias de la comuna San Miguel.' },
              { title: 'Atención Personalizada', text: 'Nuestro equipo está comprometido en ofrecer una atención amable y cercana para que disfrutes una experiencia segura y memorable.' },
            ]).map((w: { title: string; text: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 ${cardThemes[i].bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className={`w-7 h-7 ${cardThemes[i].text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cardThemes[i].icon} />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${cardThemes[i].text}`}>{w.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{w.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <FloatingShape className="top-0 right-0 w-96 h-96 bg-primary-50 -translate-y-1/2 translate-x-1/2" />
        <FloatingShape className="bottom-0 left-0 w-64 h-64 bg-accent-50 translate-y-1/2 -translate-x-1/2" delay={1} />
        <FloatingShape className="top-1/3 left-1/4 w-48 h-48 bg-primary-100" delay={2} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{org?.pageContent?.home?.servicesTitle || 'Nuestros Servicios'}</span>
            </h2>
            <SectionDivider />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {org?.pageContent?.home?.servicesSubtitle || 'Explora las experiencias que hemos preparado para que disfrutes de la naturaleza y la cultura de nuestra comunidad.'}
            </p>
          </motion.div>

          {services.length > 0 ? (
            <motion.div
              variants={pageAnim}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, idx) => (
                <motion.div key={service.id} variants={item} className="group relative">
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500"
                  />
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group-hover:border-transparent">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                    <Link to={`/servicios/${service.id}`} className="block">
                      <div className="relative h-52 overflow-hidden">
                        {service.image ? (
                          <SafeImage src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[service.category] || 'from-primary-400 to-primary-600'} flex items-center justify-center`}>
                            <span className="text-7xl opacity-30">{categoryIcons[service.category] || '🏖️'}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            {categoryIcons[service.category] || ''} {service.category}
                          </span>
                          {service.price && (
                            <span className="text-sm font-bold text-white bg-gradient-to-r from-accent-500 to-accent-600 px-3 py-1.5 rounded-full shadow-lg shadow-accent-500/30">
                              <AnimatedPrice value={service.price} />
                            </span>
                          )}
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-3 right-3 bg-accent-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            {t('common.popular')}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary-600 transition-colors">{service.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-primary-100 transition-colors">
                          <span className="text-sm text-primary-600 font-medium flex items-center gap-1.5 group-hover:text-accent-600 group-hover:gap-2.5 transition-all">
                            {t('common.verDetalle')}
                            <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                          {service.duration && (
                            <span className="text-gray-400 text-xs flex items-center gap-1 group-hover:text-gray-500 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {service.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState variant="services" title={t('home.sinServicios')} description={t('home.sinServiciosDesc')} />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
            >
              {t('home.verTodosServicios')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-cream relative overflow-hidden">
        <FloatingShape className="top-1/2 left-0 w-72 h-72 bg-primary-100 -translate-x-1/2 -translate-y-1/2" />
        <FloatingShape className="bottom-0 right-0 w-80 h-80 bg-accent-100 translate-x-1/3 translate-y-1/3" delay={1} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t('home.testimoniosTitulo')}</span>
            </h2>
            <SectionDivider />
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 text-center relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-primary-500 to-accent-500" />
                <div className="relative">
                  <svg className="absolute -top-2 -left-2 w-12 h-12 text-primary-100 -z-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4.017v10H0z" />
                  </svg>
                  <div className="relative z-10">
                    <Avatar name={testimonials[testimonialIndex].name} />
                  </div>
                </div>
                <div className="mt-6 mb-6">
                  <Stars count={testimonials[testimonialIndex].rating} />
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6 italic relative z-10">
                  &ldquo;{testimonials[testimonialIndex].text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="font-bold text-gray-800">{testimonials[testimonialIndex].name}</p>
                  <p className="text-sm text-gray-400">{testimonials[testimonialIndex].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`p-2 flex items-center justify-center rounded-full transition-all duration-500 ${i === testimonialIndex ? 'w-6 h-2 bg-accent-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4 border border-white/10">
              {t('home.necesitasAyuda')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.estamosAqui')}
            </h2>
            <p className="text-primary-200 max-w-xl mx-auto mb-8">
              {t('home.contactoWhatsApp')}
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-green-600 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-xl shadow-green-500/30"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('common.chatearWhatsApp')}
            </a>
          </motion.div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-cream via-white to-cream relative overflow-hidden">
          <FloatingShape className="top-0 right-0 w-96 h-96 bg-primary-50 -translate-y-1/2 translate-x-1/3" />
          <FloatingShape className="bottom-0 left-0 w-80 h-80 bg-accent-50 translate-y-1/2 -translate-x-1/3" delay={1} />
          <FloatingShape className="top-1/3 left-1/4 w-64 h-64 bg-primary-100" delay={2} />
          <FloatingShape className="bottom-1/3 right-1/4 w-48 h-48 bg-accent-100" delay={3} />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-4">
                {t('home.galeria')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{org?.pageContent?.home?.galleryTitle || 'Descubre Las Rocas a través de imágenes'}</span>
              </h2>
              <SectionDivider />
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                {org?.pageContent?.home?.galleryText || 'Explora fotografías de nuestros paisajes, aguas termales, senderos ecológicos y actividades turísticas. Cada imagen refleja la belleza natural y la experiencia que te espera en nuestra comunidad.'}
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl group"
                onMouseEnter={() => setGalleryPaused(true)}
                onMouseLeave={() => setGalleryPaused(false)}
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const diff = touchStartX.current - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) setGalleryIndex((prev) => (prev + 1) % gallery.length);
                    else setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
                  }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10 z-10 pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={galleryIndex}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden"
                    onClick={() => !isVideo(gallery[galleryIndex]) && openLightbox(galleryIndex)}
                  >
                    {isVideo(gallery[galleryIndex]) ? (
                      isYouTube(gallery[galleryIndex]) ? (
                        <iframe
                          src={getEmbedUrl(gallery[galleryIndex].url)}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                          title={gallery[galleryIndex].caption || ''}
                        />
                      ) : (
                        <video
                          src={gallery[galleryIndex].url}
                          className="absolute inset-0 w-full h-full object-contain bg-black"
                          controls
                          playsInline
                          preload="auto"
                          title={gallery[galleryIndex].caption || ''}
                        />
                      )
                    ) : (
                      <img
                        src={gallery[galleryIndex].url}
                        alt={gallery[galleryIndex].caption || ''}
                        className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-[2s] group-hover:scale-110"
                      />
                    )}

                    {gallery[galleryIndex].caption && (
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10"
                      >
                        <p className="text-white/90 text-lg md:text-2xl font-semibold drop-shadow-xl max-w-2xl">
                          {gallery[galleryIndex].caption}
                        </p>
                      </motion.div>
                    )}

                    {isVideo(gallery[galleryIndex]) && (
                      <div className="absolute top-5 left-5 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Video
                      </div>
                    )}

                    {gallery.length > 1 && (
                      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setGalleryPaused((p) => !p); }}
                          className="bg-black/40 backdrop-blur-sm text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/60 transition-all"
                          aria-label={galleryPaused ? 'Reanudar' : 'Pausar'}
                        >
                          {galleryPaused ? '▶' : '⏸'}
                        </button>
                        <span className="bg-black/40 backdrop-blur-sm text-white/80 text-sm font-mono px-3 py-1.5 rounded-full border border-white/10">
                          {String(galleryIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 hover:border-white/40 hover:scale-110"
                      aria-label="Anterior"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev + 1) % gallery.length); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 hover:border-white/40 hover:scale-110"
                      aria-label="Siguiente"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {gallery.length > 1 && !galleryPaused && (
                  <motion.div
                    key={galleryIndex}
                    className="absolute bottom-0 left-0 h-1 bg-accent-500 z-20"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                )}
              </motion.div>

              {gallery.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  {gallery.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 flex-shrink-0 ${
                        i === galleryIndex
                          ? 'w-28 h-20 md:w-36 md:h-24 ring-2 ring-accent-500 ring-offset-2 ring-offset-cream shadow-xl scale-105'
                          : 'w-20 h-14 md:w-28 md:h-18 opacity-60 hover:opacity-90 hover:scale-102'
                      }`}
                    >
                      {isVideo(entry) ? (
                        <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      ) : (
                        <SafeImage src={entry.url} alt="" className="w-full h-full object-cover" />
                      )}
                      {isVideo(entry) && (
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      )}
                      {i === galleryIndex && (
                        <div className="absolute inset-0 border-2 border-accent-500 rounded-2xl" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-14"
          >
            <Link
              to="/galeria"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-700 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {org?.pageContent?.home?.galleryButtonText || 'Explorar Galería'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </section>
      )}

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{org?.pageContent?.home?.newsTitle || 'Mantente informado'}</h2>
            <SectionDivider />
            <p className="text-primary-200 text-lg">{org?.pageContent?.home?.newsSubtitle || 'Conoce las últimas novedades, eventos y actividades organizadas por la Asociación Turística Las Rocas y descubre todo lo que estamos preparando para nuestros visitantes.'}</p>
          </motion.div>

          {news.length > 0 ? (
            <motion.div
              variants={pageAnim}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid md:grid-cols-3 gap-8"
            >
              {news.map((n) => (
                <motion.div key={n.id} variants={item} className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 border border-white/10">
                  <div className="h-48 overflow-hidden relative">
                    {n.image ? (
                      <SafeImage src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-primary-500/30 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/20">{n.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">{n.type}</span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-accent-300 transition-colors">{n.title}</h3>
                    <p className="text-sm text-white/60 mt-2 line-clamp-2">{n.summary || n.content}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                      {n.eventDate && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {formatDate(n.eventDate)}
                        </span>
                      )}
                      {n.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {n.location}
                        </span>
                      )}
                    </div>
                    <Link to={`/noticias`} className="inline-flex items-center gap-1 text-sm text-accent-400 font-medium mt-3 group/link hover:text-accent-300 transition-colors">
                      {t('common.leerMas')}
                      <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState variant="news" title={t('home.sinEventos')} description={t('home.sinEventosDesc')} />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
            >
              {t('home.verTodosEventos')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4 border border-white/20">
              Las Rocas
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {org?.pageContent?.home?.ctaTitle || 'Tu próxima aventura comienza aquí'}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
              {org?.pageContent?.home?.ctaText || 'Vive momentos inolvidables rodeado de naturaleza, tranquilidad y la calidez de nuestra comunidad. Reserva hoy tu visita y descubre por qué Las Rocas es uno de los destinos turísticos más especiales del cantón Naranjal.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contacto"
                className="bg-white text-accent-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 hover:-translate-y-0.5 shadow-xl"
              >
                Reservar Ahora
              </Link>
              <Link
                to="/servicios"
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ver Servicios
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path fill="white" d="M0,50 C360,0 720,100 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={pageAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={item} className="text-center p-6 group">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-500/30 transition-all group-hover:scale-110 duration-300">
                <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-white mb-2">{t('home.direccion')}</h3>
              <p className="text-gray-400">{org?.address || 'Comuna San Miguel-Naranjal-Ecuador'}</p>
            </motion.div>
            <motion.div variants={item} className="text-center p-6 group">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-500/30 transition-all group-hover:scale-110 duration-300">
                <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-white mb-2">{t('home.telefono')}</h3>
              <p className="text-gray-400">
                <a href={`tel:${org?.phone?.replace(/\s/g, '') || ''}`} className="hover:text-accent-400 transition-colors">{org?.phone || t('footer.telefono')}</a>
              </p>
            </motion.div>
            <motion.div variants={item} className="text-center p-6 group">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-500/30 transition-all group-hover:scale-110 duration-300">
                <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-white mb-2">{t('home.email')}</h3>
              <p className="text-gray-400">
                <a href={`mailto:${org?.email || ''}`} className="hover:text-accent-400 transition-colors">{org?.email || t('footer.email')}</a>
              </p>
            </motion.div>
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
