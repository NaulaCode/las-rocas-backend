import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { container } from '../../di/container';
import { Organization } from '../../domain/entities/Organization';

function BackgroundPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="login-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="300" fill="url(#login-glow)" />
      <circle cx="1200" cy="700" r="400" fill="url(#login-glow)" />
      <circle cx="700" cy="100" r="250" fill="url(#login-glow)" />
    </svg>
  );
}

function LoginSvg() {
  return (
    <svg className="w-full h-auto max-w-[320px]" viewBox="0 0 200 160" fill="none">
      <rect x="10" y="30" width="180" height="120" rx="16" fill="currentColor" className="text-primary-600/20" />
      <rect x="30" y="50" width="140" height="3" rx="1.5" fill="currentColor" className="text-white/30" />
      <rect x="30" y="62" width="100" height="3" rx="1.5" fill="currentColor" className="text-white/20" />
      <rect x="30" y="74" width="120" height="3" rx="1.5" fill="currentColor" className="text-white/20" />
      <rect x="30" y="90" width="140" height="50" rx="8" fill="currentColor" className="text-white/10" />
      <rect x="45" y="102" width="80" height="3" rx="1.5" fill="currentColor" className="text-white/15" />
      <rect x="45" y="114" width="60" height="3" rx="1.5" fill="currentColor" className="text-white/15" />
      <circle cx="170" cy="45" r="4" fill="currentColor" className="text-accent-400" />
      <circle cx="170" cy="57" r="4" fill="currentColor" className="text-accent-400" />
      <circle cx="170" cy="69" r="4" fill="currentColor" className="text-accent-400" />
      <rect x="130" y="105" width="30" height="25" rx="4" fill="currentColor" className="text-accent-400/30" />
    </svg>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    container.organization.get().then((d: Organization) => {
      setOrgName(d?.name || 'ASOTURLASROCAS');
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await container.auth.login({ email: form.email, password: form.password });
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-700 to-cyan-600 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title={t('login.titulo')} />
      <BackgroundPattern />

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
          <h1 className="text-2xl font-bold text-white mb-1">{t('login.panelAdmin')}</h1>
          <p className="text-primary-100 text-sm">{orgName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('login.titulo')}</h2>
              <p className="text-primary-200 text-xs">{t('login.ingresaCredenciales')}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/15 border border-red-400/20 text-red-200 p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2.5 backdrop-blur-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                  placeholder="admin@lasrocas"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1.5">{t('login.contrasena')}</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
                  placeholder="········"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-1 text-right">
                <Link to="/forgot-password" className="inline-block py-2 text-xs text-primary-200/60 hover:text-primary-100 transition-colors">
                  {t('login.olvideContrasena')}
                </Link>
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
                  {t('login.ingresando')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t('login.ingresar')}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-center text-primary-200/60 text-xs">
              {t('login.credencialesAdmin')}
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-primary-200/40 text-xs mt-6"
        >
          &copy; {new Date().getFullYear()} {orgName} &mdash; {t('footer.todosDerechos')}
        </motion.p>
      </motion.div>
    </div>
  );
}
