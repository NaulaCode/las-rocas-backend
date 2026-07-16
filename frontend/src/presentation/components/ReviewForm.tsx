import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../di/container';
import { CreateReviewData } from '../../domain/entities/Review';
import TurnstileWidget, { TurnstileHandle } from './TurnstileWidget';

interface Props {
  serviceId?: string;
  serviceName?: string;
}

export default function ReviewForm({ serviceId, serviceName }: Props) {
  const [form, setForm] = useState({ name: '', email: '', text: '', rating: 5, role: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileHandle>(null);
  const siteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (siteKey && !turnstileToken) {
      turnstileRef.current?.execute();
      return;
    }

    try {
      await container.reviews.submit({ ...form, serviceId, serviceName, turnstileToken } as CreateReviewData);
      setSuccess(true);
      setForm({ name: '', email: '', text: '', rating: 5, role: '' });
      setTurnstileToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-bold text-green-700 mb-1">¡Gracias por tu reseña!</h3>
        <p className="text-sm text-green-600 mb-4">Será publicada después de ser revisada.</p>
        <button onClick={() => setSuccess(false)} className="text-sm text-green-700 font-medium hover:underline">Enviar otra</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-4">Deja tu Reseña</h3>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" placeholder="tu@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                className="p-1 transition-colors">
                <svg className={`w-7 h-7 ${s <= form.rating ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-400 transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Ocupación</label>
          <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" placeholder="Ej: Turista, Guía, Visitante" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tu experiencia *</label>
          <textarea required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 min-h-[100px] resize-y" rows={3} placeholder="Cuéntanos sobre tu experiencia..." />
        </div>
        <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full bg-accent-500 text-white py-3 rounded-xl font-bold hover:bg-accent-600 disabled:opacity-50 transition-all shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 text-sm">
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Enviando...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> Enviar Reseña</>
          )}
        </motion.button>
      </div>
    </form>
  );
}
