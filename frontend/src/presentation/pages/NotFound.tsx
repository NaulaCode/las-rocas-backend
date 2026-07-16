import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <SEO title={t('notFound.titulo')} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold text-primary-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('notFound.titulo')}</h1>
        <p className="text-gray-500 mb-8">
          {t('notFound.descripcion')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('notFound.volverInicio')}
        </Link>
      </motion.div>
    </div>
  );
}
