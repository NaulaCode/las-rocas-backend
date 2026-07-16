import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'es';

  const toggle = () => {
    const next = current === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  return (
    <button
      onClick={toggle}
      className={`ml-2 px-2.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
        scrolled
          ? 'text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300'
          : 'text-white/80 border border-white/30 hover:bg-white/10 hover:text-white'
      }`}
      title={current === 'es' ? 'English' : 'Español'}
    >
      {current === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
