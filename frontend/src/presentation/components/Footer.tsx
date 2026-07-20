import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Organization } from '../../domain/entities/Organization';

export default function Footer({ org }: { org?: Organization }) {
  const { t } = useTranslation();
  const pc = org?.pageContent?.contacto || {};
  const socialLinks = [
    { url: pc.facebookUrl || '#', color: 'hover:bg-blue-600', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
    { url: pc.instagramUrl || '#', color: 'hover:bg-pink-600', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z' },
    { url: pc.twitterUrl || '#', color: 'hover:bg-blue-400', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  ];
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              {org?.logo && (
                <img src={org.logo} alt={org?.name || 'Las Rocas'} className="h-10 w-auto object-contain brightness-0 invert opacity-80" loading="lazy" />
              )}
              <h3 className="text-xl font-bold">{org?.name || 'Asociación Turística Las Rocas'}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              {org?.description || t('footer.descripcion')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.enlaces')}</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('nav.inicio')}</Link>
              <Link to="/servicios" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('nav.servicios')}</Link>
              <Link to="/noticias" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('nav.eventos')}</Link>
              <Link to="/quienes-somos" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('nav.conocenos')}</Link>
              <Link to="/contacto" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('nav.contacto')}</Link>
              <Link to="/privacidad" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('footer.politicaPrivacidad')}</Link>
              <Link to="/terminos" className="block text-gray-400 hover:text-white transition-colors text-sm">{t('footer.terminosCondiciones')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.contacto')}</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{org?.address || 'Comuna San Miguel-Naranjal'}</p>
              <p>{org?.email || 'info@lasrocas'}</p>
              {org?.phone && <p>{org.phone}</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-primary-800">
            <div className="flex gap-3 mb-4 md:mb-0">
            {socialLinks.map((sl, i) => (
              <a key={i} href={sl.url} target="_blank" rel="noopener noreferrer"
                className={`w-11 h-11 bg-primary-800 rounded-full flex items-center justify-center text-gray-400 ${sl.color} hover:text-white transition-all`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={sl.icon} /></svg>
              </a>
            ))}
            {pc.whatsappNumber && (
              <a href={`https://wa.me/${pc.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 bg-primary-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {org?.name || 'Asociación Turística Las Rocas'}. {t('footer.todosDerechos')}
          </p>
        </div>
      </div>
    </footer>
  );
}
