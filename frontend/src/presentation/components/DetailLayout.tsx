import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { PageSkeleton } from './Skeleton';

interface DetailLayoutProps {
  loading?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  gradient?: string;
  badge?: string;
  title: string;
  subtitle?: React.ReactNode;
  backTo?: { path?: string; label: string };
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  narrow?: boolean;
}

export default function DetailLayout({
  loading, seoTitle, seoDescription,
  gradient = 'from-primary-800 via-primary-700 to-accent-700',
  badge, title, subtitle, backTo,
  children, sidebar, narrow,
}: DetailLayoutProps) {
  const BackLink = backTo ? (
    backTo.path ? (
      <Link to={backTo.path}
        className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backTo.label}
      </Link>
    ) : null
  ) : null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO title={seoTitle || title} description={seoDescription} />
      <div className={`relative bg-gradient-to-br ${gradient} py-16 md:py-20 overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute -top-20 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity }} />
          <motion.div className="absolute top-10 left-20 w-20 h-20 border border-white/10 rounded-full" animate={{ y: [-10, 10, -10] }} transition={{ duration: 7, repeat: Infinity }} />
          <motion.div className="absolute bottom-10 right-32 w-32 h-32 border border-white/5 rounded-full" animate={{ y: [10, -10, 10] }} transition={{ duration: 9, repeat: Infinity }} />
          <motion.div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl" animate={{ y: [-15, 15, -15], scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-40 h-40 border border-white/5 rounded-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full" />
          </motion.div>
          <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/3 right-1/3 w-52 h-52 border border-white/5 rounded-full">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 bg-accent-500/40 rounded-full" />
          </motion.div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          {BackLink}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {badge && (
              <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 border border-white/10">
                {badge}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl">{title}</h1>
            {subtitle}
          </motion.div>
        </div>
      </div>

      <div className={`container mx-auto px-4 -mt-6 relative z-20`}>
        {sidebar ? (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8 pb-16">
              {children}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">
                {sidebar}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${narrow ? 'max-w-4xl' : ''} pb-16`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
