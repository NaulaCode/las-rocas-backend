import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SEO from '../components/SEO';
import { container } from '../../di/container';
import { Organization } from '../../domain/entities/Organization';
import { TouristicService } from '../../domain/entities/TouristicService';
import { Reservation } from '../../domain/entities/Reservation';
import TurnstileWidget, { TurnstileHandle } from '../components/TurnstileWidget';
import { CreateContactMessageData } from '../../domain/entities/ContactMessage';

const pageAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

const inputClass = "w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100/50 focus:shadow-lg focus:shadow-primary-500/5 transition-all duration-300";

function InputIcon({ icon }: { icon: JSX.Element }) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-400 pointer-events-none">
      {icon}
    </div>
  );
}

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ delay }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function SectionDivider({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className={`w-8 h-0.5 rounded-full ${light ? 'bg-white/30' : 'bg-primary-200'}`} />
      <span className={`w-2 h-2 rounded-full ${light ? 'bg-accent-300' : 'bg-accent-500'}`} />
      <span className={`w-8 h-0.5 rounded-full ${light ? 'bg-white/30' : 'bg-primary-200'}`} />
    </div>
  );
}

const socialLinks = [
  { key: 'facebookUrl', label: 'Facebook', hover: 'hover:bg-blue-50 hover:text-blue-600', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
  { key: 'instagramUrl', label: 'Instagram', hover: 'hover:bg-pink-50 hover:text-pink-600', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z' },
  { key: 'twitterUrl', label: 'Twitter', hover: 'hover:bg-blue-50 hover:text-blue-400', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  { key: 'whatsappUrl', label: 'WhatsApp', hover: 'hover:bg-green-50 hover:text-green-600', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
];

export default function Contact() {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [contactTab, setContactTab] = useState<'reserva' | 'consulta'>('reserva');

  const [form, setForm] = useState({
    serviceId: '',
    serviceName: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    numberOfPeople: 1,
    preferredDate: '',
    message: '',
  });
  const [services, setServices] = useState<TouristicService[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState<{ available: boolean; booked: number } | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [contactTurnstileToken, setContactTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileHandle>(null);
  const contactTurnstileRef = useRef<TurnstileHandle>(null);
  const siteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string | undefined;

  useEffect(() => {
    Promise.all([
      container.services.getAllActive(),
      container.organization.get().catch(() => null),
      container.reservations.getAll().catch(() => []),
    ]).then(([svc, orgData, res]) => {
      setServices(svc);
      setOrg(orgData);
      const taken = new Set<string>();
      res
        .filter((r: Reservation) => r.status === 'pendiente' || r.status === 'confirmada')
        .forEach((r: Reservation) => {
          if (r.preferredDate) taken.add(r.preferredDate);
        });
      setBookedDates(taken);
    });
  }, []);

  useEffect(() => {
    if (form.serviceId && form.preferredDate) {
      setCheckingAvail(true);
      container.reservations.getAvailability(form.serviceId, form.preferredDate)
        .then(setAvailability)
        .catch(() => setAvailability(null))
        .finally(() => setCheckingAvail(false));
    } else {
      setAvailability(null);
    }
  }, [form.serviceId, form.preferredDate]);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([-2.760096, -79.626700], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
      L.marker([-2.760096, -79.626700]).addTo(mapInstance.current)
        .bindPopup('Asociación Turística Las Rocas');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (siteKey && !turnstileToken) {
      turnstileRef.current?.execute();
      return;
    }

    try {
      await container.reservations.create({ ...form, turnstileToken } as import('../../domain/entities/Reservation').CreateReservationDTO);
      setSuccess(true);
      setForm({
        serviceId: '',
        serviceName: '',
        userName: '',
        userEmail: '',
        userPhone: '',
        numberOfPeople: 1,
        preferredDate: '',
        message: '',
      });
      setTurnstileToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (siteKey && !contactTurnstileToken) {
      contactTurnstileRef.current?.execute();
      return;
    }

    try {
      await container.contact.send({ ...contactForm, turnstileToken: contactTurnstileToken } as CreateContactMessageData);
      setSuccess(true);
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setContactTurnstileToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = org?.pageContent?.contacto?.whatsappNumber || '';

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-green-700">{t('contact.exito')}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t('contact.exitoDesc')}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/mi-reserva"
              className="w-full bg-accent-500 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-accent-600 transition-all shadow-lg shadow-accent-500/20"
            >
              {t('contact.consultarEstado')}
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-green-500 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('common.chatearWhatsApp')}
            </a>
            <button
              onClick={() => setSuccess(false)}
              className="text-primary-600 hover:text-primary-700 font-semibold py-2 transition-colors"
            >
              {t('contact.enviarOtro')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO title={t('contact.seoTitulo')} description={t('contact.seoDescripcion')} />
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 overflow-hidden min-h-[50vh] flex items-center">
        <FloatingShape className="top-20 left-10 w-96 h-96 bg-accent-500" delay={0} />
        <FloatingShape className="bottom-10 right-20 w-80 h-80 bg-primary-300" delay={1} />
        <FloatingShape className="top-1/3 right-1/4 w-64 h-64 bg-white" delay={2} />
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1" d="M0,60 C360,120 720,0 1440,60 L1440,120 L0,120 Z" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 container mx-auto px-4 py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {org?.pageContent?.contacto?.pageTitle || 'Contáctanos'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-primary-100 text-lg max-w-2xl mx-auto"
          >
            {org?.pageContent?.contacto?.pageSubtitle || 'Estamos para atenderte. Reserva tu próxima experiencia'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            <a href={`tel:${whatsappNumber}`}
              className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all text-sm border border-white/10 hover:border-white/20">
              <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('contact.llamar')}
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all text-sm border border-white/10 hover:border-white/20">
              <svg className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('common.whatsapp')}
            </a>
            <a href={`mailto:${org?.pageContent?.contacto?.email || 'info@asoturlasrocas.com'}`}
              className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-all text-sm border border-white/10 hover:border-white/20">
              <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('common.email')}
            </a>
          </motion.div>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 -mt-10 pb-16">
        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <motion.div
            variants={pageAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="lg:col-span-3"
          >
            <motion.div variants={item} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-50 rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
                  <button onClick={() => { setContactTab('reserva'); setError(''); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${contactTab === 'reserva' ? 'bg-white text-primary-700 shadow-lg shadow-gray-200/50 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {t('contact.reservar')}
                    </span>
                  </button>
                  <button onClick={() => { setContactTab('consulta'); setError(''); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${contactTab === 'consulta' ? 'bg-white text-primary-700 shadow-lg shadow-gray-200/50 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {t('contact.consultar')}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{org?.pageContent?.contacto?.formTitle || 'Formulario de Reserva'}</h2>
                    <p className="text-sm text-gray-400">{t('contact.formCompleta')}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {contactTab === 'reserva' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.servicio')}</label>
                    <div className="relative group">
                      <InputIcon icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      } />
                      <select value={form.serviceId}
                        onChange={(e) => {
                          const service = services.find(s => s.id === e.target.value);
                          setForm({ ...form, serviceId: e.target.value, serviceName: service?.name || '' });
                        }}
                        className={inputClass + " appearance-none bg-white"}>
                        <option value="">{t('contact.seleccionarServicio')}</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {form.serviceId && (() => {
                        const s = services.find(x => x.id === form.serviceId);
                        return s?.price ? (
                          <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                            ${s.price}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.nombre')}</label>
                      <div className="relative">
                        <InputIcon icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        } />
                        <input type="text" required value={form.userName}
                          onChange={(e) => setForm({ ...form, userName: e.target.value })}
                          className={inputClass} placeholder={t('contact.nombre')} />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.telefono')}</label>
                      <div className="relative">
                        <InputIcon icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        } />
                        <input type="tel" value={form.userPhone}
                          onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
                          className={inputClass} placeholder={t('contact.telefono')} />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.email')}</label>
                    <div className="relative">
                      <InputIcon icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      } />
                      <input type="email" required value={form.userEmail}
                        onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                        className={inputClass} placeholder={t('contact.email')} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.personas')}</label>
                      <div className="relative">
                        <InputIcon icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        } />
                        <input type="number" min="1" value={form.numberOfPeople}
                          onChange={(e) => setForm({ ...form, numberOfPeople: parseInt(e.target.value) || 1 })}
                          className={inputClass} />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.fecha')}</label>
                      <div className="relative">
                        <InputIcon icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        } />
                        <input type="date" value={form.preferredDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                          className={inputClass} />
                      </div>
                      {form.preferredDate && checkingAvail && (
                        <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1 ml-1">
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t('contact.verificando')}
                        </p>
                      )}
                      {form.preferredDate && !checkingAvail && availability && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1 ml-1 ${availability.available ? 'text-emerald-600' : 'text-red-500'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {availability.available
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                          </svg>
                          {availability.available
                            ? t('contact.fechaDisponible')
                            : t('contact.fechaConReservas', { n: availability.booked })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.mensaje')}</label>
                    <textarea value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={inputClass + " min-h-[100px] resize-y"} rows={4}
                      placeholder={t('contact.mensajePlaceholder')} />
                  </div>

                  <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-4 rounded-xl font-bold text-lg hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 transition-all shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {t('contact.enviando')}</>
                    ) : (
                      <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> {t('contact.enviarReserva')}</>
                    )}
                  </motion.button>
                </form>
                ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.nombre')}</label>
                      <div className="relative">
                        <InputIcon icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                        <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className={inputClass} placeholder={t('contact.nombre')} />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.telefono')}</label>
                      <div className="relative">
                        <InputIcon icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                        <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className={inputClass} placeholder={t('contact.telefono')} />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.email')}</label>
                    <div className="relative">
                      <InputIcon icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                      <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className={inputClass} placeholder={t('contact.email')} />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.asunto')}</label>
                    <div className="relative">
                      <InputIcon icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>} />
                      <input type="text" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className={inputClass} placeholder={t('contact.asuntoPlaceholder')} />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.mensaje')}</label>
                    <textarea required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className={inputClass + " min-h-[120px] resize-y"} rows={4} placeholder={t('contact.contactPlaceholder')} />
                  </div>
                  <TurnstileWidget ref={contactTurnstileRef} onToken={setContactTurnstileToken} />
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {t('contact.enviando')}</>
                    ) : (
                      <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> {t('contact.enviar')}</>
                    )}
                  </motion.button>
                </form>
                )}
              </div>
            </motion.div>
          </motion.div>

          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-[2] transition-transform duration-700" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent-500/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('contact.yaTienesReserva')}</h3>
                  <p className="text-primary-100 text-sm mb-6 leading-relaxed">{t('contact.consultaEstado')}</p>
                  <Link to="/mi-reserva"
                    className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm group/btn">
                    {t('contact.consultarEstadoBtn')}
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-[2] transition-transform duration-700" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('contact.chateaNosotros')}</h3>
                  <p className="text-orange-100 text-sm mb-6 leading-relaxed">{t('contact.disponiblesWA')}</p>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-accent-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm group/btn">
                    {t('contact.escribirWA')}
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 group hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t('contact.nuestraUbicacion')}</h3>
                </div>
                <div className="relative">
                  <div ref={mapRef} className="bg-gray-100 rounded-xl h-56 z-0 border-2 border-transparent group-hover:border-primary-200 transition-colors duration-300"></div>
                </div>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-3">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {org?.address || 'Comuna San Miguel, Naranjal, Guayas, Ecuador'}
                </p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=-2.760096,-79.626700" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors mt-2 group/link">
                  <svg className="w-4 h-4 group-hover/link:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                  {t('contact.comoLlegar')}
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t('contact.horarios')}</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      {t('contact.lunesViernes')}
                    </span>
                    <span className="text-gray-800 font-semibold text-sm">{org?.pageContent?.contacto?.hoursWeekdays || '8:00 AM - 6:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      {t('contact.sabados')}
                    </span>
                    <span className="text-gray-800 font-semibold text-sm">{org?.pageContent?.contacto?.hoursSaturday || '8:00 AM - 6:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {t('contact.domingos')}
                    </span>
                    <span className="text-accent-600 font-semibold text-sm">{org?.pageContent?.contacto?.hoursSunday || '8:00 AM - 6:00 PM'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t('contact.redesSociales')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((sl) => {
                    const contacto = org?.pageContent?.contacto || {};
                    const url = sl.key === 'whatsappUrl'
                      ? `https://wa.me/${whatsappNumber}`
                      : contacto[sl.key as keyof typeof contacto] as string || '#';
                    return (
                      <a key={sl.key} href={url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2.5 px-4 py-3.5 bg-gray-50 rounded-xl text-gray-500 transition-all duration-300 text-sm font-medium ${sl.hover} group/social`}>
                        <svg className="w-5 h-5 group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d={sl.icon} />
                        </svg>
                        <span>{sl.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
