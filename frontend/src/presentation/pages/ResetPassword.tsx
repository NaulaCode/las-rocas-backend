import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { container } from '../../di/container';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      setError(t('resetPassword.tokenNoValido'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('resetPassword.contrasenaMinLength'));
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError(t('resetPassword.contrasenasNoCoinciden'));
      setLoading(false);
      return;
    }

    try {
      await container.auth.resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl max-w-[420px] w-full text-center"
        >
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">{t('resetPassword.errorEnlace')}</h2>
          <p className="text-primary-200 text-sm mb-6">{t('resetPassword.linkInvalidoDesc')}</p>
          <Link to="/forgot-password" className="text-accent-400 hover:text-accent-300 text-sm transition-colors">
            {t('resetPassword.solicitarNuevo')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title={t('resetPassword.titulo')} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rp-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="300" fill="url(#rp-glow)" />
        <circle cx="1200" cy="700" r="400" fill="url(#rp-glow)" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('resetPassword.titulo')}</h1>
          <p className="text-primary-100 text-sm">{t('resetPassword.ingresaContrasena')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
        >
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{t('resetPassword.contrasenaActualizada')}</h3>
              <p className="text-primary-200 text-sm mb-6">{t('resetPassword.contrasenaActualizadaDesc')}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-accent-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('login.ingresar')}
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('resetPassword.nuevaContrasena')}</h2>
                  <p className="text-primary-200 text-xs">{t('resetPassword.minimoCaracteres')}</p>
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
                  <label className="block text-sm font-medium text-primary-100 mb-1.5">{t('resetPassword.nuevaContrasena')}</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                      placeholder="········"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-100 mb-1.5">{t('resetPassword.confirmarContrasena')}</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                      placeholder="········"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-primary-200/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded bg-white/5 border-white/10 text-accent-500 focus:ring-accent-500"
                  />
                  {t('resetPassword.mostrarContrasenas')}
                </label>

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
                      {t('resetPassword.actualizando')}
                    </>
                  ) : (
                    t('resetPassword.restablecer')
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
