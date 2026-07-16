import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ICookieConsentStorage } from '../../domain/ports/ICookieConsentStorage';

interface Props {
  storage: ICookieConsentStorage;
}

export default function CookieConsent({ storage }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!storage.isAccepted()) setVisible(true);
  }, [storage]);

  const accept = () => {
    storage.accept();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-sm text-gray-600">
              <p>{t('cookieConsent.text')}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={accept}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-700 transition-all whitespace-nowrap"
              >
                {t('cookieConsent.accept')}
              </button>
              <button
                onClick={accept}
                className="text-gray-500 px-4 py-2.5 rounded-full text-sm hover:bg-gray-100 transition-all whitespace-nowrap"
              >
                {t('cookieConsent.close')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
