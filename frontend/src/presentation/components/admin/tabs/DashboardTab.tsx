import { useState } from 'react';
import { TouristicService } from '../../../../domain/entities/TouristicService';
import { News } from '../../../../domain/entities/News';
import { Reservation } from '../../../../domain/entities/Reservation';
import { ChatbotQuestion } from '../../../../domain/entities/ChatbotQuestion';
import { PublicUser } from '../../../../domain/entities/User';
import { PageContent } from '../../../../domain/entities/Organization';
import StatCard from '../StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { downloadPDF, generateFullReport } from '../../../utils/pdf';

interface Props {
  services: TouristicService[];
  news: News[];
  reservations: Reservation[];
  questions: ChatbotQuestion[];
  adminUsers: PublicUser[];
  pageContent: PageContent;
  monthlyReservations: { month: string; count: number }[];
  topServices: { serviceId: string; serviceName: string; count: number }[];
  loadData: () => void;
  openCreate: (type: string) => void;
  setTab: (t: string) => void;
  toast: any;
}

export default function DashboardTab({ services, news, reservations, questions, adminUsers, pageContent, monthlyReservations, topServices, loadData, openCreate, setTab, toast }: Props) {
  const statusColors: Record<string, string> = {
    pendiente: '#F59E0B', confirmada: '#3B82F6', completada: '#10B981', cancelada: '#EF4444',
  };

  const reservationsByStatus = [
    { name: 'Pendiente', value: reservations.filter((r) => r.status === 'pendiente').length },
    { name: 'Confirmada', value: reservations.filter((r) => r.status === 'confirmada').length },
    { name: 'Completada', value: reservations.filter((r) => r.status === 'completada').length },
    { name: 'Cancelada', value: reservations.filter((r) => r.status === 'cancelada').length },
  ];

  const categorySet = new Set(services.map((s) => s.category));
  const servicesByCategory = Array.from(categorySet).map((cat) => ({
    name: cat,
    value: services.filter((s) => s.category === cat).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Panel de Control</h2>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          label="Servicios Activos"
          value={services.filter((s) => s.isActive).length}
          color="bg-blue-500"
          onClick={() => setTab('services')}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          label="Reservas Pendientes"
          value={reservations.filter((r) => r.status === 'pendiente').length}
          color="bg-yellow-500"
          onClick={() => setTab('reservations')}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
          label="Noticias Publicadas"
          value={news.filter((n) => n.isPublished).length}
          color="bg-purple-500"
          onClick={() => setTab('news')}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Acceso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nuevo Servicio', tab: 'services', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: 'Nueva Noticia', tab: 'news', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { label: 'Nueva Pregunta', tab: 'chatbot', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          ].map((btn) => (
            <button key={btn.label} onClick={() => { openCreate(btn.tab === 'chatbot' ? 'chatbot' : btn.tab === 'services' ? 'service' : 'news'); }}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center ${btn.color}`}>{btn.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Reservas por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reservationsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {reservationsByStatus.map((e, i) => <Bar key={i} dataKey="value" fill={statusColors[e.name.toLowerCase()] || '#0088FE'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Servicios por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={servicesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {monthlyReservations && monthlyReservations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Reservas Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyReservations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Servicios Más Reservados</h3>
          {topServices && topServices.length > 0 ? (
            <div className="space-y-3">
              {topServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-gray-700">{s.serviceName}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{s.count} reservas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No hay datos suficientes</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen General</h3>
          <div className="space-y-3">
            {(() => {
              const totalReservations = reservations.length;
              const confirmedCompleted = reservations.filter((r) => r.status === 'confirmada' || r.status === 'completada').length;
              const inactiveServices = services.filter((s) => !s.isActive).length;
              const pendingReviews = (pageContent.reviews || []).filter((r: any) => !r.approved).length;
              const totalReviews = (pageContent.reviews || []).length;
              return [
                { label: 'Servicios', value: `${services.length} (${inactiveServices} inactivos)`, color: 'text-blue-600', sub: true },
                { label: 'Noticias', value: `${news.length} (${news.filter((n) => n.isPublished).length} publicadas)`, color: 'text-purple-600', sub: true },
                { label: 'Reservas', value: `${totalReservations} totales`, color: 'text-yellow-600', sub: false },
                { label: 'Tasa Conv.', value: totalReservations > 0 ? `${Math.round(confirmedCompleted / totalReservations * 100)}%` : '0%', color: 'text-emerald-600', sub: false },
                { label: 'Preguntas FAQ', value: String(questions.length), color: 'text-orange-600', sub: false },
                { label: 'Reseñas', value: `${totalReviews} (${pendingReviews} x revisar)`, color: 'text-indigo-600', sub: true },
                { label: 'Admins', value: String(adminUsers.length), color: 'text-red-600', sub: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {item.sub && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => downloadPDF(reservations, services)} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Exportar PDF (Reservas)
          </button>
          <button onClick={() => generateFullReport(services, news, reservations, questions, pageContent)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Reporte Completo
          </button>
        </div>
      </div>
    </div>
  );
}
