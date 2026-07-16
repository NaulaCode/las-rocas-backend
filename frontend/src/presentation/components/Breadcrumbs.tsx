import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const routeKeys: Record<string, string> = {
  servicios: 'breadcrumbs.servicios',
  noticias: 'breadcrumbs.noticias',
  'quienes-somos': 'breadcrumbs.quienesSomos',
  contacto: 'breadcrumbs.contacto',
  login: 'breadcrumbs.login',
  admin: 'breadcrumbs.admin',
  'mi-reserva': 'breadcrumbs.miReserva',
  atractivos: 'breadcrumbs.atractivos',
  galeria: 'breadcrumbs.galeria',
  privacidad: 'breadcrumbs.privacidad',
  terminos: 'breadcrumbs.terminos',
};

export default function Breadcrumbs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link to="/" className="text-gray-400 hover:text-primary-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </li>
          {segments.map((seg, i) => {
            const href = '/' + segments.slice(0, i + 1).join('/');
            const isLast = i === segments.length - 1;
            const label = routeKeys[seg] ? t(routeKeys[seg]) : seg.charAt(0).toUpperCase() + seg.slice(1);
            return (
              <li key={seg} className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isLast ? (
                  <span className="text-primary-600 font-medium">{label}</span>
                ) : (
                  <Link to={href} className="text-gray-400 hover:text-primary-600 transition-colors">{label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
