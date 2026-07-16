import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  variant?: 'services' | 'news' | 'gallery' | 'reservations' | 'search' | 'error';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  extra?: ReactNode;
}

const icons: Record<string, JSX.Element> = {
  services: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <circle cx="60" cy="60" r="3" className="text-primary-300" fill="currentColor" />
      <path d="M60 5v15M60 100v15M5 60h15M100 60h15" stroke="currentColor" strokeWidth="2" className="text-gray-200" strokeLinecap="round" />
      <motion.circle cx="20" cy="20" r="6" fill="currentColor" className="text-primary-200" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="100" cy="20" r="6" fill="currentColor" className="text-accent-200" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      <motion.circle cx="20" cy="100" r="6" fill="currentColor" className="text-accent-200" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
      <motion.circle cx="100" cy="100" r="6" fill="currentColor" className="text-primary-200" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />
    </svg>
  ),
  news: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="10" width="90" height="100" rx="8" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <rect x="25" y="20" width="70" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="25" y="38" width="55" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="25" y="48" width="60" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="25" y="58" width="40" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="25" y="74" width="70" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="34" y="82" width="20" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="34" y="90" width="15" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <motion.path d="M15 35L5 25" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.path d="M105 35l10-10" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
    </svg>
  ),
  gallery: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="15" width="100" height="90" rx="8" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <rect x="25" y="30" width="30" height="25" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="65" y="30" width="30" height="55" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="25" y="63" width="30" height="22" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <motion.path d="M35 30l-15-10" stroke="currentColor" strokeWidth="2" className="text-primary-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.path d="M95 30l15-10" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
      <motion.path d="M25 63l-15 10" stroke="currentColor" strokeWidth="2" className="text-primary-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
    </svg>
  ),
  search: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="52" cy="52" r="25" stroke="currentColor" strokeWidth="2.5" className="text-gray-200" />
      <path d="M70 70l18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-200" />
      <motion.line x1="40" y1="40" x2="48" y2="48" stroke="currentColor" strokeWidth="2" className="text-primary-200" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.line x1="56" y1="56" x2="64" y2="64" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
    </svg>
  ),
  reservations: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="90" height="90" rx="8" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <rect x="15" y="30" width="90" height="14" rx="3" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <circle cx="35" cy="37" r="3" className="text-primary-300" fill="currentColor" />
      <rect x="30" y="55" width="60" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="30" y="67" width="50" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <rect x="30" y="79" width="40" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-gray-200" />
      <motion.rect x="25" y="55" width="8" height="8" rx="2" fill="currentColor" className="text-accent-200" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.rect x="25" y="67" width="8" height="8" rx="2" fill="currentColor" className="text-primary-200" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
      <motion.rect x="25" y="79" width="8" height="8" rx="2" fill="currentColor" className="text-accent-200" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
    </svg>
  ),
  error: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="55" r="35" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
      <path d="M60 40v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-300" />
      <circle cx="60" cy="62" r="3" className="text-gray-300" fill="currentColor" />
      <motion.path d="M40 25l-15-5" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} />
      <motion.path d="M80 25l15-5" stroke="currentColor" strokeWidth="2" className="text-accent-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} />
      <motion.path d="M40 90l-15 5" stroke="currentColor" strokeWidth="2" className="text-primary-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.6 }} />
      <motion.path d="M80 90l15 5" stroke="currentColor" strokeWidth="2" className="text-primary-200" strokeLinecap="round" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 2.4 }} />
    </svg>
  ),
};

export default function EmptyState({ variant = 'search', title, description, action, extra }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-32 h-32 mx-auto mb-6 text-gray-300"
      >
        {icons[variant] || icons.search}
      </motion.div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-all shadow-sm"
        >
          {action.label}
        </motion.button>
      )}
      {extra}
    </motion.div>
  );
}
