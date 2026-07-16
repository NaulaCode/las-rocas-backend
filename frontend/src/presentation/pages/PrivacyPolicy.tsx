import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      <SEO title={t('privacy.titulo')} />
      <div className="bg-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-white/70 hover:text-white text-sm mb-4 inline-block">&larr; {t('common.backToHome')}</Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">{t('privacy.titulo')}</h1>
          <p className="text-white/70 mt-2">{t('privacy.ultimaActualizacion')} {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introducción</h2>
            <p className="text-gray-600 leading-relaxed">
              En cumplimiento con la Ley de Protección de Datos Personales, ponemos a disposición de los titulares de
              datos personales la presente política de privacidad, con el objeto de informar sobre el tratamiento que
              se dará a sus datos personales al navegar y utilizar los servicios de nuestra plataforma.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Datos que recopilamos</h2>
            <p className="text-gray-600 leading-relaxed">Podemos recopilar la siguiente información:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información de navegación (cookies)</li>
              <li>Datos de reservas y preferencias de servicios</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Finalidad del tratamiento</h2>
            <p className="text-gray-600 leading-relaxed">Los datos personales serán utilizados para:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Gestionar reservas de servicios turísticos</li>
              <li>Enviar confirmaciones y actualizaciones de estado</li>
              <li>Mejorar nuestros servicios y atención al cliente</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies propias y de terceros para mejorar la experiencia de navegación. Puedes configurar
              el uso de cookies en cualquier momento desde la configuración de tu navegador.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Derechos del usuario</h2>
            <p className="text-gray-600 leading-relaxed">
              Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales.
              Para ejercer estos derechos, contáctanos a través de nuestro formulario de contacto.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de
              nuestra página de <Link to="/contacto" className="text-primary-600 hover:text-primary-700 underline">contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
