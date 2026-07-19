import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { container } from '../../di/container';
import SEO from '../components/SEO';
import { PageSkeleton } from '../components/Skeleton';
import { Organization } from '../../domain/entities/Organization';

const pageAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const icons = [
  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
];

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const num = parseInt(value) || 0;
  const suffix = value.replace(/[\d]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = Math.max(1, Math.floor(num / steps));
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, num]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
        {inView ? count : 0}{suffix}
      </div>
      <p className="text-gray-500 text-sm md:text-base">{label}</p>
    </div>
  );
}

function KpiCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = Math.max(1, Math.floor(value / steps));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  const display = count >= 1000 ? count.toLocaleString('es-EC') : count.toString();

  return (
    <div ref={ref}>
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-600 to-green-500 bg-clip-text text-transparent mb-2">
        {inView ? display : '0'}{suffix}
      </div>
      <p className="text-gray-600 text-sm md:text-base font-medium">{label}</p>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="w-8 h-0.5 bg-primary-200 rounded-full" />
      <span className="w-2 h-2 bg-accent-500 rounded-full" />
      <span className="w-8 h-0.5 bg-primary-200 rounded-full" />
    </div>
  );
}

export default function Conocenos() {
  const { t } = useTranslation();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const valueData = [
    { title: 'Compromiso', desc: 'Trabajamos con responsabilidad y dedicación para ofrecer experiencias seguras y de calidad a cada visitante.', icon: icons[0] },
    { title: 'Respeto por la naturaleza', desc: 'Promovemos el cuidado del medio ambiente y el uso responsable de los recursos naturales que hacen único nuestro destino.', icon: icons[1] },
    { title: 'Trabajo en equipo', desc: 'Creemos que la unión y la colaboración entre los miembros de la asociación fortalecen el desarrollo de nuestra comunidad.', icon: icons[4] },
    { title: 'Calidad', desc: 'Buscamos mejorar continuamente nuestros servicios e instalaciones para brindar una experiencia satisfactoria a todos nuestros visitantes.', icon: icons[5] },
    { title: 'Hospitalidad', desc: 'Recibimos a cada persona con amabilidad, calidez y el compromiso de hacer que su visita sea memorable.', icon: icons[2] },
    { title: 'Responsabilidad', desc: 'Actuamos con transparencia y compromiso, promoviendo un turismo sostenible que beneficie tanto a la comunidad como al entorno natural.', icon: icons[3] },
  ];

  const defaultStats = [
    { value: '10', label: 'Socios fundadores' },
    { value: '14', label: 'Servicios turísticos' },
    { value: '2013', label: 'Años de experiencia' },
  ];

  useEffect(() => {
    container.organization.get()
      .then((data) => { setOrg(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  const stats = ((org?.pageContent?.conocenos?.stats || defaultStats) as Array<{ value: string; label: string }>).map((s) => ({
    value: s.value?.toString() || '0',
    label: s.label,
  }));

  const values = org?.pageContent?.conocenos?.values || valueData;
  const historyParagraphs = (org?.history || 'La Asociación Turística Las Rocas fue fundada en el año 2013 por diez socios de la comuna San Miguel, ubicada en el cantón Naranjal, provincia del Guayas. Su creación surgió como respuesta a las dificultades económicas que enfrentaba la comunidad debido a la disminución del apoyo de entidades gubernamentales. Frente a esta realidad, los socios fundadores decidieron convertir la adversidad en una oportunidad de crecimiento. Al reconocer el potencial de las aguas termales como un recurso natural único, impulsaron un proyecto de turismo comunitario que permitiera generar empleo, fortalecer la economía local y promover el desarrollo sostenible. Con esfuerzo, compromiso y trabajo en equipo, la asociación fue consolidando un complejo turístico que hoy recibe visitantes de diferentes lugares del país. Actualmente, sus principales ingresos provienen de la venta de entradas a las piscinas de aguas termales y de los productos y servicios ofrecidos en el bar del complejo, recursos que contribuyen al mantenimiento de las instalaciones y al fortalecimiento continuo de la asociación. Más allá de la actividad turística, la Asociación Turística Las Rocas mantiene un firme compromiso con la conservación del entorno natural, la atención de calidad a sus visitantes y el bienestar de la comunidad que la vio nacer.')
    .split('. ')
    .filter(Boolean);

  return (
    <div className="bg-white">
      <SEO title={t('conocenos.titulo')} description={t('conocenos.seoDescripcion')} />
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${org?.coverImage || 'https://images.unsplash.com/photo-1504457047772-27faf9c0f3e9?w=1920&h=1080&fit=crop'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-800/75 to-primary-900/90"></div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/5 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-primary-100 border border-white/10 mb-6"
            >
              ASOTURLASROCAS
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              {org?.pageContent?.conocenos?.title || 'Conócenos'}
            </h1>
            <p className="text-xl text-primary-200 max-w-2xl mx-auto leading-relaxed">
              {org?.pageContent?.conocenos?.heroSubtitle || 'Descubre quiénes somos y cómo nació la Asociación Turística Las Rocas, una iniciativa comunitaria que promueve el turismo sostenible, el bienestar y la conservación de la naturaleza en la comuna San Miguel, cantón Naranjal.'}
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-1.5"
              >
                <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={pageAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={item} className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">{org?.pageContent?.conocenos?.historiaTitle || t('conocenos.historia')}</span>
              </h2>
              <SectionDivider />
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-accent-200 to-primary-200 rounded-full" />
              <div className="space-y-8">
                {historyParagraphs.map((p: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="relative pl-0 md:pl-16"
                  >
                    <div className="hidden md:flex absolute left-4 top-2 w-8 h-8 bg-white border-2 border-primary-300 rounded-full items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                      <p className="text-gray-600 leading-relaxed text-lg">{p}{i < historyParagraphs.length - 1 ? '.' : ''}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50/80 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={pageAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <motion.div variants={item} className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full group-hover:scale-[3] transition-transform duration-700 opacity-50" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Misión</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {org?.mission || 'Brindar experiencias de bienestar y recreación en el cantón Naranjal mediante servicios turísticos de calidad, promoviendo el contacto responsable con la naturaleza, fortaleciendo el turismo local y contribuyendo a la conservación ambiental.'}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="group">
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-50 rounded-full group-hover:scale-[3] transition-transform duration-700 opacity-50" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-500/20">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Visión</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {org?.vision || 'Consolidarnos como un referente regional en turismo comunitario y actividades al aire libre en el cantón Naranjal, destacándonos por ofrecer experiencias únicas, fomentar el desarrollo sostenible y preservar el patrimonio natural para las futuras generaciones.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={item} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">{org?.pageContent?.conocenos?.valuesTitle || 'Nuestros Valores'}</span>
              </h2>
              <SectionDivider />
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {values.map((val: { title: string; desc: string }, i: number) => {
                const v = valueData[i % valueData.length];
                return (
                  <motion.div
                    key={val.title}
                    variants={item}
                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-primary-500/10">
                        <svg className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">{val.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{val.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #fefce8 100%)' }}>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-100 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Impacto y Conservación</span>
            </h2>
            <SectionDivider />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mt-4">
              Preservamos la riqueza natural del bosque húmedo tropical del cantón Naranjal, promoviendo un turismo sostenible que protege nuestra biodiversidad única.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-8 shadow-lg shadow-emerald-500/5 hover:shadow-xl transition-all duration-500 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <KpiCounter value={2780} suffix="" label="Hectáreas de bosque húmedo tropical protegidas" />
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Un área equivalente a más de 3,900 canchas de fútbol, hogar de cientos de especies de flora y fauna.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-8 shadow-lg shadow-amber-500/5 hover:shadow-xl transition-all duration-500 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent mb-2">
                Rana Militar Arlequín
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Especie emblemática de nuestra zona. El Bosque Húmedo Tropical de Naranjal alberga una biodiversidad única, con especies endémicas y migratorias que conviven en este ecosistema protegido.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl p-8 shadow-lg shadow-green-500/5 hover:shadow-xl transition-all duration-500 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <KpiCounter value={6} suffix="+" label="Rutas de senderismo y agroturismo" />
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Explora nuestros senderos ecológicos, recorre plantaciones de cacao y café, y conecta con las tradiciones agrícolas de la comuna San Miguel.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl p-6 md:p-8 text-center shadow-sm">
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Cada visita a <strong>Las Rocas</strong> contribuye directamente a la conservación de estas <strong>2,780 hectáreas</strong> de bosque húmedo tropical. Al recorrer nuestros senderos, disfrutar de las aguas termales y participar en actividades de agroturismo, estás ayudando a proteger un ecosistema invaluable para las futuras generaciones.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">¿Qué nos hace diferentes?</span>
            </h2>
            <SectionDivider />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-100">
              {(org?.pageContent?.conocenos?.differentSection || 'En la Asociación Turística Las Rocas combinamos naturaleza, bienestar y turismo comunitario para ofrecer experiencias auténticas en un entorno seguro y acogedor. Nuestro principal atractivo son las aguas termales naturales, complementadas con senderos ecológicos, espacios de recreación y la hospitalidad característica de la comuna San Miguel.\n\nCada visita contribuye al desarrollo de la comunidad y al fortalecimiento de un modelo de turismo responsable que busca conservar los recursos naturales mientras genera oportunidades para las familias que forman parte de la asociación.').split('\n\n').map((p: string, i: number) => (
                <p key={i} className={`text-gray-600 leading-relaxed text-lg${i > 0 ? ' mt-4' : ''}`}>{p}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50/80 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Nuestras Actividades</span>
            </h2>
            <SectionDivider />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(org?.pageContent?.conocenos?.activities || [
              { title: 'Senderismo y contacto con la naturaleza', text: 'Recorre senderos rodeados de vegetación y disfruta de un ambiente ideal para la observación del paisaje y la biodiversidad de la zona.' },
              { title: 'Aguas termales', text: 'Relájate en nuestras piscinas de aguas termales naturales, reconocidas por ofrecer un espacio propicio para el descanso, la relajación y el bienestar físico.' },
              { title: 'Recreación familiar', text: 'Comparte momentos inolvidables con familiares y amigos en un ambiente tranquilo, rodeado de naturaleza y espacios diseñados para el descanso.' },
              { title: 'Turismo comunitario', text: 'Al visitarnos apoyas directamente el desarrollo económico de la comuna San Miguel y contribuyes al fortalecimiento del turismo sostenible en la región.' },
            ]).map((a: { title: string; text: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{a.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-accent-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Nuestro Compromiso</h2>
            <p className="text-primary-200 text-lg leading-relaxed max-w-3xl mx-auto">
              {org?.pageContent?.conocenos?.commitmentText || 'Trabajamos cada día para ofrecer un servicio de calidad que permita a nuestros visitantes disfrutar de la naturaleza de manera responsable. Nuestro compromiso es conservar los recursos naturales, fortalecer el turismo comunitario y promover el desarrollo sostenible de la comuna San Miguel, generando beneficios para las familias que forman parte de la Asociación Turística Las Rocas.'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {org?.pageContent?.conocenos?.invitationTitle || 'Vive la experiencia Las Rocas'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-lg">
              {org?.pageContent?.conocenos?.invitationText || 'Te invitamos a descubrir un lugar donde la naturaleza, la tranquilidad y la hospitalidad se unen para ofrecer experiencias inolvidables. Ven y disfruta de nuestras aguas termales, recorre nuestros senderos y forma parte de una iniciativa que impulsa el turismo comunitario y el desarrollo sostenible del cantón Naranjal.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/servicios"
                className="inline-flex items-center gap-2 bg-accent-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/25"
              >
                Ver Servicios
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Contáctanos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-primary-50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Cómo llegar</span>
            </h2>
            <SectionDivider />
            <p className="text-gray-500 text-lg max-w-xl mx-auto mt-4">
              Descubre cómo llegar a Las Rocas y vive una experiencia inolvidable en la comuna San Miguel.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop"
                  alt="Relieve del Cantón Naranjal"
                  className="w-full h-72 md:h-96 object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-white">
                  <p className="text-xs text-gray-400 text-center">
                    Relieve del Cantón Naranjal — Provincia del Guayas, Ecuador
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Dirección de acceso</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Entrando por el recinto <strong>La Unión</strong>, de la vía <strong>Naranjal - Balao</strong>.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Comuna San Miguel, Cantón Naranjal, Provincia del Guayas</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Escanea y conoce cómo llegar
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://www.google.com/maps?q=-2.760096,-79.626700')}`}
                      alt="QR Google Maps"
                      className="w-32 h-32"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 leading-relaxed">
                    <p>Abre Google Maps en tu celular y escanea el código QR para obtener indicaciones precisas desde tu ubicación hasta Las Rocas.</p>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="aspect-video w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.229836823826!2d-79.626700!3d-2.760096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNDUnMzYuMyJTIDc5wrAzNyczNi4xIlc!5e0!3m2!1ses!2sec!4v1"
                    className="w-full h-full"
                    style={{ minHeight: '250px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de Google Maps - Las Rocas"
                  />
                </div>
                <div className="p-4 bg-white text-center">
                  <a
                    href="https://www.google.com/maps?q=-2.760096,-79.626700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Abrir en Google Maps
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
