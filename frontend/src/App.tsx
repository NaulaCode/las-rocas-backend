import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './presentation/components/Toast';

import ErrorBoundary from './presentation/components/ErrorBoundary';
import Layout from './presentation/components/Layout';
import SEO from './presentation/components/SEO';

const Home = lazy(() => import('./presentation/pages/Home'));
const Services = lazy(() => import('./presentation/pages/Services'));
const ServicioDetalle = lazy(() => import('./presentation/pages/ServicioDetalle'));
const News = lazy(() => import('./presentation/pages/News'));
const Contact = lazy(() => import('./presentation/pages/Contact'));
const Admin = lazy(() => import('./presentation/pages/Admin'));
const Login = lazy(() => import('./presentation/pages/Login'));
const ForgotPassword = lazy(() => import('./presentation/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./presentation/pages/ResetPassword'));
const CheckReservation = lazy(() => import('./presentation/pages/CheckReservation'));
const Conocenos = lazy(() => import('./presentation/pages/Conocenos'));
const Galeria = lazy(() => import('./presentation/pages/Galeria'));
const TouristicAttractions = lazy(() => import('./presentation/pages/TouristicAttractions'));
const TouristicAttractionDetail = lazy(() => import('./presentation/pages/TouristicAttractionDetail'));
const NewsDetail = lazy(() => import('./presentation/pages/NewsDetail'));
const PrivacyPolicy = lazy(() => import('./presentation/pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./presentation/pages/TermsAndConditions'));
const NotFound = lazy(() => import('./presentation/pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <SEO />
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="servicios" element={<Services />} />
                  <Route path="servicios/:id" element={<ServicioDetalle />} />
                  <Route path="noticias" element={<News />} />
                  <Route path="noticias/:id" element={<NewsDetail />} />
                  <Route path="contacto" element={<Contact />} />
                  <Route path="login" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="quienes-somos" element={<Conocenos />} />
                  <Route path="mi-reserva" element={<CheckReservation />} />
                  <Route path="galeria" element={<Galeria />} />
                  <Route path="atractivos" element={<TouristicAttractions />} />
                  <Route path="atractivos/:id" element={<TouristicAttractionDetail />} />
                  <Route path="privacidad" element={<PrivacyPolicy />} />
                  <Route path="terminos" element={<TermsAndConditions />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}
