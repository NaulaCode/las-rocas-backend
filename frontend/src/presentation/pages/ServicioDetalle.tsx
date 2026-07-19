import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../di/container';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import ImageLightbox from '../components/ImageLightbox';
import type { TouristicService } from '../../domain/entities/TouristicService';
import type { Reservation } from '../../domain/entities/Reservation';
import AnimatedPrice from '../components/AnimatedPrice';
import ReviewForm from '../components/ReviewForm';
import type { Review } from '../../domain/entities/Review';

const pageAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;

export default function ServicioDetalle() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<TouristicService | null>(null);
  const [related, setRelated] = useState<TouristicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', numberOfPeople: 1, preferredDate: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      container.services.getById(id),
      container.reservations.getAll().catch(() => []),
    ]).then(([s, res]) => {
      setService(s);
      setReservations(res);
      const taken = new Set<string>();
      res
        .filter((r: Reservation) => r.serviceId === id && (r.status === 'pendiente' || r.status === 'confirmada'))
        .forEach((r: Reservation) => {
          if (r.preferredDate) taken.add(r.preferredDate.slice(0, 10));
        });
      setBookedDates(taken);
      const serviceName = s?.name;
      container.reviews.getApproved(serviceName).then(setReviews).catch(() => {});
      return container.services.getByCategory(s.category);
    })
      .then((all) => {
        setRelated(all.filter((s) => s.id !== id).slice(0, 3));
      })
      .catch(() => navigate('/servicios'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (form.preferredDate && bookedDates.has(form.preferredDate)) {
      setError(t('serviceDetail.fechaNoDisponible'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await container.reservations.create({ serviceId: id, serviceName: service?.name, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSaving(false);
    }
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${service?.name} - ${window.location.href}`)}`, '_blank');
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const copyLink = () => navigator.clipboard.writeText(window.location.href);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary-100 to-gray-100 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-10 bg-gray-100 rounded w-2/3" />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="flex gap-3 mt-6">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl w-28" />)}
              </div>
            </div>
            <div className="h-80 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const images = service.image ? [{ url: service.image, caption: service.name }] : [];

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = service.availableUntil ? service.availableUntil.slice(0, 10) < todayStr : false;
  const minDate = service.availableFrom
    ? new Date(Math.max(new Date(service.availableFrom).getTime(), Date.now())).toISOString().split('T')[0]
    : todayStr;

  const details = [
    { label: t('serviceDetail.precio'), value: service.price ? <><AnimatedPrice value={service.price} /></> : t('serviceDetail.consultar'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: t('serviceDetail.duracion'), value: service.duration || t('serviceDetail.variable'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: t('serviceDetail.ubicacion'), value: service.location || t('serviceDetail.comunaSanMiguel'), icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { label: t('serviceDetail.horario'), value: service.schedule || t('serviceDetail.consultar'), icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO title={service?.name || t('serviceDetail.seoTituloFallback')} description={service?.description || t('serviceDetail.seoDescFallback')} />
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute -top-20 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity }} />
          <motion.div className="absolute top-10 left-20 w-20 h-20 border border-white/10 rounded-full" animate={{ y: [-10, 10, -10] }} transition={{ duration: 7, repeat: Infinity }} />
          <motion.div className="absolute bottom-10 right-32 w-32 h-32 border border-white/5 rounded-full" animate={{ y: [10, -10, 10] }} transition={{ duration: 9, repeat: Infinity }} />
          <motion.div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl" animate={{ y: [-15, 15, -15], scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.volver')}
          </motion.button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 border border-white/10">
              {service.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl">{service.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              {service.price && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Desde <span className="text-white font-semibold"><AnimatedPrice value={service.price} /></span>
                </span>
              )}
              {service.duration && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {service.duration}
                </span>
              )}
              {service.location && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {service.location}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <motion.div
          variants={pageAnim}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-3 gap-10"
        >
          <motion.div variants={item} className="lg:col-span-2 space-y-10 pb-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('serviceDetail.descripcion')}
              </h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">{service.description}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t('serviceDetail.detalles')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {details.map((d, i) => (
                  <motion.div
                    key={d.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mb-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d.icon} />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{d.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{d.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {service.image && (
              <motion.div variants={item}>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('galeria.titulo')}
                  </h2>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer group bg-gray-100"
                    onClick={() => setLightboxIndex(0)}
                  >
                    <SafeImage
                      src={service.image}
                      alt={service.name}
                      className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={item} className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="mb-5">
                  <p className="text-sm text-gray-400 font-medium mb-1">{t('serviceDetail.precio')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {service.price ? <><AnimatedPrice value={service.price} /></> : t('serviceDetail.consultar')}
                  </p>
                  {service.duration && <p className="text-sm text-gray-500 mt-0.5">{t('serviceDetail.per')} {service.duration}</p>}
                  {service.availableUntil && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Disponible hasta {new Date(service.availableUntil).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-red-700">{t('serviceDetail.noDisponible')}</p>
                    <p className="text-xs text-red-500 mt-1">{t('serviceDetail.expirado')}</p>
                  </div>
                ) : !showForm ? (
                  <div className="space-y-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowForm(true)}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('serviceDetail.reservarAhora')}
                      </span>
                    </motion.button>
                    <Link
                      to={`/contacto?service=${service.id}`}
                      className="block w-full text-center py-3 rounded-xl font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      {t('serviceDetail.formularioReserva')}
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">{t('serviceDetail.reservaRapida')}</p>
                    {success && !showReview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                          className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <p className="text-green-700 font-bold text-sm">{t('serviceDetail.reservaExitosa')}</p>
                        <p className="text-gray-400 text-xs mt-1">{t('serviceDetail.reservaExitosaDesc')}</p>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          onClick={() => setShowReview(true)}
                          className="mt-4 text-xs text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
                        >
                          {t('serviceDetail.dejarResena')}
                        </motion.button>
                      </motion.div>
                    )}

                    {success && showReview && (
                      <ReviewForm serviceId={service?.id} serviceName={service?.name} />
                    )}

                    {!success && (
                      <>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <input required placeholder={t('serviceDetail.nombre')} value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white transition-all" />
                        </div>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <input required type="email" placeholder={t('serviceDetail.email')} value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white transition-all" />
                        </div>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <input placeholder={t('serviceDetail.whatsapp')} value={form.userPhone} onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input type="number" min="1" placeholder={t('serviceDetail.personas')} value={form.numberOfPeople} onChange={(e) => setForm({ ...form, numberOfPeople: parseInt(e.target.value) || 1 })}
                              className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white transition-all" />
                          </div>
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input type="date" value={form.preferredDate}
                              min={minDate}
                              max={service.availableUntil || undefined}
                              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                              className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white transition-all ${
                                form.preferredDate && bookedDates.has(form.preferredDate)
                                  ? 'border-amber-300 focus:border-amber-400'
                                  : 'border-gray-200 focus:border-primary-400'
                              }`} />
                            {form.preferredDate && bookedDates.has(form.preferredDate) && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                {t('serviceDetail.conReservas')}
                              </span>
                            )}
                          </div>
                        </div>
                        {form.preferredDate && !bookedDates.has(form.preferredDate) && (
                          <p className="text-green-600 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('serviceDetail.fechaDisponible')}
                          </p>
                        )}
                        {form.preferredDate && bookedDates.has(form.preferredDate) && (
                          <p className="text-amber-600 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('serviceDetail.fechaDisponibilidadLimitada')}
                          </p>
                        )}
                        {error && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                          </p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <motion.button
                            type="submit"
                            disabled={saving}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                          >
                            {saving ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {t('serviceDetail.enviando')}
                              </span>
                            ) : t('serviceDetail.enviarReserva')}
                          </motion.button>
                          <button type="button" onClick={() => setShowForm(false)}
                            className="px-4 py-3 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
                            {t('common.cancelar')}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-gray-200">
                  <button onClick={shareWhatsApp} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title={t('common.whatsapp')}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </button>
                  <button onClick={shareFacebook} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title={t('common.facebook')}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                  </button>
                  <button onClick={copyLink} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title={t('common.copiarEnlace')}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-sm">
                    ?
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{t('serviceDetail.necesitasAyuda')}</p>
                    <p className="text-gray-500 text-xs mb-3">{t('serviceDetail.contactanos')}</p>
                    <Link to="/contacto" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-600 transition-colors">
                      {t('common.contactar')}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {related.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              className="pb-20"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
                <h2 className="text-2xl font-bold text-gray-800">{t('serviceDetail.serviciosRelacionados')}</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {related.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative cursor-pointer"
                    onClick={() => navigate(`/servicios/${r.id}`)}
                  >
                    <motion.div
                      className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-0 group-hover:opacity-15 blur transition-all duration-500"
                    />
                    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {r.image ? (
                          <SafeImage src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-300">{r.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors">{r.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{r.description}</p>
                        {r.price && (
                          <p className="text-sm font-bold text-primary-700 mt-3">$<AnimatedPrice value={r.price} /></p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">{t('serviceDetail.resenas')}</h2>
          </div>

          {reviews.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                      {r.role && <p className="text-xs text-gray-400">{r.role}</p>}
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-lg mx-auto">
            {showReview ? (
              <ReviewForm serviceId={service?.id} serviceName={service?.name} />
            ) : (
              <button onClick={() => setShowReview(true)}
                className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {t('serviceDetail.dejarResena')}
              </button>
            )}
          </div>
        </section>
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
