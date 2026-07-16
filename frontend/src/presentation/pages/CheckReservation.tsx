import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { container } from '../../di/container';
import type { Reservation } from '../../domain/entities/Reservation';
import { generateReservationPDF } from '../utils/pdf';

function ConfirmModal({ open, onConfirm, onCancel, title, message }: { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; message: string }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">{t('common.cancelar')}</button>
          <button onClick={onConfirm} className="px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">{t('checkReservation.cancelarConfirmar')}</button>
        </div>
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; icon: string }> = {
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    icon: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  confirmada: {
    label: 'Confirmada',
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  cancelada: {
    label: 'Cancelada',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  completada: {
    label: 'Completada',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
};

export default function CheckReservation() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; active: boolean }>>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [org, setOrg] = useState<{ name?: string; logo?: string } | null>(null);

  useState(() => {
    container.organization.get().then((org) => {
      setOrg(org);
      const notifs = org?.pageContent?.notifications || [];
      setNotifications(notifs.filter((n) => n.active));
    }).catch(() => {});
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const data = await container.reservations.getByEmail(email);
      setReservations(data);
      setSearched(true);
    } catch {
      setError(t('checkReservation.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelError('');
    try {
      await container.reservations.cancel(id, email);
      setReservations(prev => prev!.map(r => r.id === id ? { ...r, status: 'cancelada' as Reservation['status'] } : r));
      setCancelling(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Error al cancelar');
    }
  };

  const activeNotifs = notifications.filter((n) => !dismissedNotifs.has(n.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO title={t('checkReservation.titulo')} description={t('checkReservation.instrucciones')} />
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <motion.div
            className="absolute top-10 right-20 w-16 h-16 border border-white/10 rounded-full"
            animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-20 w-24 h-24 border border-white/5 rounded-full"
            animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {t('checkReservation.titulo')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-200 text-lg max-w-xl mx-auto"
          >
            {t('checkReservation.instrucciones')}
          </motion.p>
        </div>
      </div>

      {activeNotifs.length > 0 && (
        <div className="container mx-auto px-4 mt-6 relative z-20">
          <div className="max-w-2xl mx-auto space-y-2">
            {activeNotifs.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 flex-1 leading-relaxed">{notif.message}</p>
                <button
                  onClick={() => setDismissedNotifs((prev) => new Set(prev).add(notif.id))}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-lg transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white/80 text-sm transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('common.cargando')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('checkReservation.consultar')}
                  </>
                )}
              </motion.button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {reservations !== null && (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-10 pb-16"
            >
              {reservations.length > 0 ? (
                <>
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                    <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {reservations.length}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                      {reservations.length} {reservations.length !== 1 ? 'reservas encontradas' : 'reserva encontrada'}
                    </span>
                  </motion.div>

                  <div className="space-y-4">
                    {reservations.map((r, i) => {
                      const status = statusConfig[r.status] || statusConfig.pendiente;
                      return (
                        <motion.div
                          key={r.id}
                          variants={itemVariants}
                          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800">{r.serviceName || 'Reserva Turística'}</h3>
                                  <p className="text-xs text-gray-400">ID: {r.id?.slice(0, 8)}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                <span>{r.status}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50/80 rounded-xl">
                              <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">{t('checkReservation.cliente')}</p>
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {r.userName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">{t('common.email')}</p>
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 truncate">
                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {r.userEmail}
                                </p>
                              </div>
                              {r.preferredDate && (
                                <div>
                                  <p className="text-xs text-gray-400 font-medium mb-1">{t('checkReservation.fecha')}</p>
                                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(r.preferredDate).toLocaleDateString('es-EC', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              )}
                              {r.numberOfPeople && (
                                <div>
                                  <p className="text-xs text-gray-400 font-medium mb-1">{t('checkReservation.personas')}</p>
                                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {r.numberOfPeople}
                                  </p>
                                </div>
                              )}
                            </div>

                            {r.message && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-400 font-medium mb-1">{t('checkReservation.mensaje')}</p>
                                <p className="text-sm text-gray-600">{r.message}</p>
                              </div>
                            )}
                          </div>
                          {(r.status === 'pendiente' || r.status === 'confirmada') && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                              <button onClick={() => {
                                const el = document.createElement('div');
                                generateReservationPDF({
                                  id: r.id, serviceName: r.serviceName || '',
                                  userName: r.userName, userEmail: r.userEmail,
                                  userPhone: r.userPhone, numberOfPeople: r.numberOfPeople,
                                  preferredDate: r.preferredDate, message: r.message,
                                  status: r.status, orgName: org?.name,
                                }, t);
                              }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1.5 px-3 py-2 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {t('checkReservation.descargarPDF')}
                              </button>
                              <button onClick={() => setCancelling(r.id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1.5 px-3 py-2 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {t('checkReservation.cancelarReserva')}
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  {cancelError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {cancelError}
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('checkReservation.noReservas')}</h3>
                  <p className="text-gray-400 max-w-sm mx-auto text-sm">
                    {t('checkReservation.noReservasDesc')}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setReservations(null); setEmail(''); setError(''); }}
                    className="mt-6 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Nueva consulta
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmModal
        open={!!cancelling}
        title={t('checkReservation.cancelarReserva')}
        message={t('checkReservation.confirmarCancelacion')}
        onConfirm={() => cancelling && handleCancel(cancelling)}
        onCancel={() => { setCancelling(null); setCancelError(''); }}
      />
    </div>
  );
}
