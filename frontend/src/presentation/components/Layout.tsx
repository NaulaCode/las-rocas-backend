import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../di/container';
import type { Organization } from '../../domain/entities/Organization';
import Chatbot from './Chatbot';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CookieConsent from './CookieConsent';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [org, setOrg] = useState<Organization | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  const loadOrg = () => {
    container.organization.get()
      .then(setOrg)
      .catch(() => {});
  };

  useEffect(() => {
    loadOrg();
    window.addEventListener('focus', loadOrg);
    return () => window.removeEventListener('focus', loadOrg);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(window.scrollY / total, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: t('nav.inicio') },
    { to: '/servicios', label: t('nav.servicios') },
    { to: '/atractivos', label: t('nav.atractivos') },
    { to: '/noticias', label: t('nav.eventos') },
    { to: '/quienes-somos', label: t('nav.conocenos') },
    { to: '/galeria', label: t('nav.galeria') },
    { to: '/contacto', label: t('nav.contacto') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md'
            : 'bg-primary-700'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              {org?.logo ? (
                <img src={org.logo} alt={org?.name || 'Las Rocas'} className="h-10 w-auto object-contain" loading="lazy" />
              ) : (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  scrolled
                    ? 'bg-primary-600 text-white group-hover:bg-primary-700'
                    : 'bg-white/20 text-white group-hover:bg-white/30'
                }`}>
                  LR
                </div>
              )}
              <span className={`font-bold text-lg transition-colors duration-300 ${
                scrolled ? 'text-primary-800' : 'text-white'
              }`}>
                {org?.name || 'Las Rocas'}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? scrolled
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white/20 text-white'
                      : scrolled
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/mi-reserva"
                className={`ml-3 px-3 py-3 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all duration-200 relative ${
                  scrolled
                    ? 'text-gray-600 hover:bg-gray-100 hover:text-primary-700'
                    : 'text-white/80 hover:bg-white/10'
                }`}
                title={t('nav.notificaciones')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
                <LanguageSwitcher scrolled={scrolled} />
              <Link
                to="/login"
                className={`ml-1 px-5 py-3 rounded-full font-bold text-sm flex items-center gap-1.5 transition-all duration-200 ${
                  scrolled
                    ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/30'
                    : 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('nav.admin')}
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/contacto"
                className={`p-3 rounded-full transition-colors ${
                  scrolled ? 'text-primary-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                title="Reservar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
                <span className="font-bold text-primary-800">{t('nav.menu')}</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-accent-500 text-white rounded-xl font-bold text-sm hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('nav.panelAdmin')}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div
        className="fixed top-16 md:top-20 left-0 right-0 h-0.5 bg-gray-200 z-50"
        style={{ opacity: scrollProgress > 0 ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        <div
          className="h-full bg-gradient-to-r from-accent-500 to-primary-500 transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <main className="flex-1 pt-16 md:pt-20">
        <AnimatePresence>
          {org?.pageContent?.notifications
            ?.filter((n: any) => {
              if (!n.active || dismissedNotifs.has(n.id)) return false;
              const now = new Date();
              if (n.startDate && now < new Date(n.startDate)) return false;
              if (n.endDate && now > new Date(n.endDate)) return false;
              return true;
            })
            .map((n: any) => (
              <motion.div
                key={n.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="bg-gradient-to-r from-accent-600 to-primary-600 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
                  <p className="text-sm font-medium flex-1 text-center">{n.message}</p>
                  <button onClick={() => setDismissedNotifs(prev => new Set(prev).add(n.id))}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 ml-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        <Outlet />
      </main>

      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-40 w-12 h-12 bg-primary-600 text-white rounded-full shadow-xl hover:bg-primary-700 hover:shadow-2xl flex items-center justify-center transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={t('nav.volverArriba')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

        <Footer org={org} />
      <WhatsAppButton />
      <Chatbot />
      <CookieConsent storage={container.cookieConsentStorage} />
    </div>
  );
}
