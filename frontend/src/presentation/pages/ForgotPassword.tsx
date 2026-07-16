import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { container } from '../../di/container';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await container.auth.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-700 to-cyan-600 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title={t('forgotPassword.titulo')} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fg-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="300" fill="url(#fg-glow)" />
        <circle cx="1200" cy="700" r="400" fill="url(#fg-glow)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('forgotPassword.titulo')}</h1>
          <p className="text-primary-100 text-sm">{t('forgotPassword.teEnviaremos')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t('forgotPassword.revisaCorreo')}</h3>
              <p className="text-primary-200 text-sm mb-6">
                {t('forgotPassword.siExiste', { email })}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('forgotPassword.volverLogin')}
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('forgotPassword.email')}</h2>
                  <p className="text-primary-200 text-xs">{t('forgotPassword.ingresaEmail')}</p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/15 border border-red-400/20 text-red-200 p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2.5 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-100 mb-1.5">{t('forgotPassword.email')}</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                      placeholder="admin@lasrocas"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-accent-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-accent-600 disabled:opacity-50 transition-all shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('forgotPassword.enviando')}
                    </>
                  ) : (
                    t('forgotPassword.enviarEnlace')
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary-200/60 hover:text-primary-100 transition-colors">
                  {t('forgotPassword.volverLogin')}
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
