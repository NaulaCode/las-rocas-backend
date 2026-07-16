import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const sections = [
  {
    title: '1. Aceptación de los Términos',
    content: 'Al acceder y utilizar el sitio web de ASOTURLASROCAS, usted acepta cumplir y estar sujeto a estos Términos y Condiciones de Uso. Si no está de acuerdo con alguno de estos términos, le solicitamos que no utilice nuestro sitio web ni nuestros servicios.',
  },
  {
    title: '2. Servicios Ofrecidos',
    content: 'ASOTURLASROCAS ofrece servicios turísticos que incluyen hospedaje, gastronomía, actividades de aventura, transporte y paquetes turísticos en la Comuna San Miguel, Naranjal, Ecuador. Los servicios están sujetos a disponibilidad y pueden variar sin previo aviso.',
  },
  {
    title: '3. Reservas y Pagos',
    content: 'Las reservas realizadas a través de nuestro sitio web están sujetas a confirmación. Nos reservamos el derecho de cancelar o modificar reservas en caso de fuerza mayor o circunstancias imprevistas. Los precios publicados están en dólares americanos (USD) e incluyen impuestos aplicables, salvo que se indique lo contrario.',
  },
  {
    title: '4. Política de Cancelación',
    content: 'Las cancelaciones deben realizarse con al menos 24 horas de anticipación para obtener un reembolso completo. Cancelaciones realizadas con menos de 24 horas de anticipación pueden estar sujetas a cargos. En caso de no presentarse (no-show), no se realizará reembolso.',
  },
  {
    title: '5. Responsabilidad del Usuario',
    content: 'El usuario se compromete a proporcionar información veraz y completa al realizar una reserva. El usuario es responsable de mantener la confidencialidad de sus datos personales. ASOTURLASROCAS no se hace responsable por daños o pérdidas derivados del uso incorrecto de la plataforma.',
  },
  {
    title: '6. Propiedad Intelectual',
    content: 'Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos y material audiovisual, es propiedad de ASOTURLASROCAS o sus licenciantes. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.',
  },
  {
    title: '7. Privacidad de Datos',
    content: 'La información personal proporcionada por los usuarios será tratada de acuerdo con nuestra Política de Privacidad. ASOTURLASROCAS implementa medidas de seguridad para proteger los datos personales contra acceso no autorizado.',
  },
  {
    title: '8. Modificaciones',
    content: 'ASOTURLASROCAS se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Se recomienda a los usuarios revisar periódicamente esta página.',
  },
  {
    title: '9. Ley Aplicable',
    content: 'Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa relacionada con el uso del sitio web o los servicios será resuelta en los tribunales competentes de Naranjal, Ecuador.',
  },
  {
    title: '10. Contacto',
    content: 'Para consultas sobre estos términos, puede contactarnos a través de nuestro formulario de contacto, correo electrónico o WhatsApp disponibles en nuestra página de contacto.',
  },
];

export default function TermsAndConditions() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={t('terms.titulo')} description={t('terms.subtitulo')} />
      <section className="bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500 py-16 text-center">
        <motion.div className="container mx-auto px-4" {...fadeUp}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('terms.titulo')}</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            {t('terms.ultimaActualizacion')}
          </p>
        </motion.div>
      </section>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 md:p-10" {...fadeUp}>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Bienvenido al sitio web de la Asociación Turística Las Rocas (ASOTURLASROCAS). Al acceder y utilizar este sitio web, usted acepta cumplir con los siguientes términos y condiciones. Le recomendamos leerlos detenidamente antes de utilizar nuestros servicios.
          </p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-4">{t('terms.contactaNos')}</p>
            <Link to="/contacto" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t('common.contactar')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
