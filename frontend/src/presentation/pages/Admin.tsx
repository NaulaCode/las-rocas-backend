import { useState, useEffect, useCallback, lazy, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../di/container';
import SEO from '../components/SEO';
import { useToast } from '../components/Toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { TouristicService } from '../../domain/entities/TouristicService';
import { TouristicAttraction, AttractionCategory } from '../../domain/entities/TouristicAttraction';
import { Reservation, ReservationStatus } from '../../domain/entities/Reservation';
import { News, NewsType } from '../../domain/entities/News';
import { User, PublicUser, UserRole } from '../../domain/entities/User';
import { Organization, PageContent } from '../../domain/entities/Organization';
import { ChatbotQuestion, ChatbotStats } from '../../domain/entities/ChatbotQuestion';
import Modal from '../components/admin/Modal';
import { AdminFormData, ServiceForm } from '../components/admin/forms/ServiceForm';
import { NewsForm } from '../components/admin/forms/NewsForm';
import { ChatbotForm } from '../components/admin/forms/ChatbotForm';
import { AttractionForm } from '../components/admin/forms/AttractionForm';
import { ReservationForm } from '../components/admin/forms/ReservationForm';

import { tabIcons, sectionVariants } from '../components/admin/tabIcons';

const DashboardTab = lazy(() => import('../components/admin/tabs/DashboardTab'));
const ServicesTab = lazy(() => import('../components/admin/tabs/ServicesTab'));
const NewsTab = lazy(() => import('../components/admin/tabs/NewsTab'));
const ReservationsTab = lazy(() => import('../components/admin/tabs/ReservationsTab'));
const ChatbotTab = lazy(() => import('../components/admin/tabs/ChatbotTab'));
const StatsTab = lazy(() => import('../components/admin/tabs/StatsTab'));
const AttractionsTab = lazy(() => import('../components/admin/tabs/AttractionsTab'));
const PagesTab = lazy(() => import('../components/admin/tabs/PagesTab'));
const ContactMessageTab = lazy(() => import('../components/admin/tabs/ContactMessageTab'));
const ReviewsTab = lazy(() => import('../components/admin/tabs/ReviewsTab'));

const ActivityLogTab = lazy(() => import('../components/admin/tabs/ActivityLogTab'));
const RolesTab = lazy(() => import('../components/admin/tabs/RolesTab'));

const tabLabels: Record<string, string> = {
  dashboard: 'Panel de Control', services: 'Servicios', news: 'Noticias y Eventos',
  reservations: 'Reservas', chatbot: 'FAQ Chatbot', estadisticas: 'Estadísticas',
  pages: 'Páginas', attractions: 'Atractivos', reviews: 'Reseñas',
  mensajes: 'Mensajes', activity: 'Actividad', roles: 'Roles y Permisos',
};

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const tab = searchParams.get('tab') || 'dashboard';
  const setTab = useCallback((t: string) => setSearchParams({ tab: t }), [setSearchParams]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  const [services, setServices] = useState<TouristicService[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [questions, setQuestions] = useState<ChatbotQuestion[]>([]);
  const [attractions, setAttractions] = useState<TouristicAttraction[]>([]);

  const [chatbotStats, setChatbotStats] = useState<ChatbotStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const [pageTab, setPageTab] = useState('home');
  const [pageContent, setPageContent] = useState<PageContent>({});
  const [orgForm, setOrgForm] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: string; initial?: AdminFormData } | null>(null);
  const [form, setForm] = useState<AdminFormData>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [adminUsers, setAdminUsers] = useState<PublicUser[]>([]);
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminNewFirstName, setAdminNewFirstName] = useState('');
  const [adminNewLastName, setAdminNewLastName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [editingUserData, setEditingUserData] = useState<{ firstName: string; lastName: string; email: string; role: UserRole }>({ firstName: '', lastName: '', email: '', role: 'admin' });
  const [monthlyReservations, setMonthlyReservations] = useState<{ month: string; count: number }[]>([]);
  const [topServices, setTopServices] = useState<{ serviceId: string; serviceName: string; count: number }[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [contactRefresh, setContactRefresh] = useState(0);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      container.services.getAllIncludingInactive().catch(() => []),
      container.news.getAllIncludingUnpublished().catch(() => []),
      container.reservations.getAll().catch(() => []),
      container.chatbot.getQuestions().catch(() => []),
      container.organization.get().catch(() => null),
      container.attractions.getAllIncludingInactive().catch(() => []),
      container.contact.getAll().catch(() => []),
      container.auth.getUsers().catch(() => []),

    ])
      .then(([srv, nw, rs, qtns, orgData, atr, msgs, adminUsrs]: any[]) => {
        setUnreadMessages(msgs.filter((m: any) => !m.isRead).length);
        setServices(srv);
        setNews(nw);
        setReservations(rs);
        setQuestions(qtns);
        setOrg(orgData);
        setAttractions(atr);
        setAdminUsers(adminUsrs);
        setPageContent(orgData?.pageContent || {});
        setLogoUrl(orgData?.logo || '');
        setOrgForm({
          name: orgData?.name || '',
          legalName: orgData?.legalName || '',
          ruc: orgData?.ruc || '',
          website: orgData?.website || '',
          description: orgData?.description || '',
          mission: orgData?.mission || '',
          vision: orgData?.vision || '',
          history: orgData?.history || '',
          phone: orgData?.phone || '',
          email: orgData?.email || '',
          address: orgData?.address || '',
          coverImage: orgData?.coverImage || '',
        });
      })
      .finally(() => setLoading(false));
  };

  const loadDashboardStats = () => {
    container.reservations.getMonthly().then(setMonthlyReservations).catch(() => {});
    container.reservations.getTopServices(5).then(setTopServices).catch(() => {});
    container.auth.getUsers().then(setAdminUsers).catch(() => {});
  };

  useEffect(() => {
    container.auth.me()
      .then(u => {
        setUser(u);
        container.auth.myPermissions()
          .then(setUserPermissions)
          .catch(() => {});
      })
      .catch(() => {
        container.auth.logout();
        navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  useEffect(() => {
    setSearchTerm('');
    setFilterValue('');
    setStartDate('');
    setEndDate('');
    setServiceFilter('');
  }, [tab]);

  useEffect(() => {
    if (tab === 'estadisticas' && !chatbotStats) {
      setLoadingStats(true);
      container.chatbot.getStats()
        .then(setChatbotStats)
        .catch(() => {})
        .finally(() => setLoadingStats(false));
    }
    if (tab === 'paginas' && pageTab === 'usuarios-admin') {
      container.auth.getUsers().then(setAdminUsers).catch(() => {});
    }
    if (tab === 'dashboard') {
      loadDashboardStats();
    }
  }, [tab, chatbotStats]);

  useEffect(() => {
    if (tab === 'paginas' && pageTab === 'usuarios-admin') {
      container.auth.getUsers().then(setAdminUsers).catch(() => {});
    }
  }, [pageTab, tab]);

  const refreshReservations = useCallback(() => {
    container.reservations.getAll().then(setReservations).catch(() => {});
  }, []);

  const refreshMessages = useCallback(() => {
    container.contact.getAll().then(msgs => setUnreadMessages(msgs.filter(m => !m.isRead).length)).catch(() => {});
  }, []);

  useWebSocket({
    'new-reservation': () => {
      toast('Nueva reserva recibida', 'info');
      refreshReservations();
    },
    'reservation-status-changed': () => {
      refreshReservations();
    },
    'new-contact-message': () => {
      toast('Nuevo mensaje de contacto', 'info');
      setContactRefresh(n => n + 1);
      refreshMessages();
    },
    'new-audit-log': () => {
      setActivityRefresh(n => n + 1);
    },
  });

  useKeyboardShortcuts({
    'Ctrl+1': () => setTab('dashboard'),
    'Ctrl+2': () => setTab('services'),
    'Ctrl+3': () => setTab('news'),
    'Ctrl+4': () => setTab('reservations'),
    'Ctrl+5': () => setTab('chatbot'),
    'Ctrl+6': () => setTab('estadisticas'),
    'Ctrl+7': () => setTab('pages'),
    'Ctrl+8': () => setTab('attractions'),
    'Ctrl+9': () => setTab('mensajes'),
    'Ctrl+0': () => setTab('activity'),

    'Ctrl+R': () => setTab('roles'),
    'Ctrl+K': () => setTab('dashboard'),
  });

  const handleLogout = () => {
    container.auth.logout();
    navigate('/login');
  };

  const openCreate = (type: string) => {
    setForm({});
    setModal({ type, initial: undefined });
  };

  const openEdit = (type: string, item: AdminFormData) => {
    const formatted = item.eventDate ? item.eventDate.substring(0, 10) : undefined;
    setForm({ ...item, eventDate: formatted });
    setModal({ type, initial: item });
  };

  const handleSave = async () => {
    try {
    const m = modal!;
    const isEdit = !!m.initial;
    const initial = m.initial;

    if (m.type === 'service') {
      const payload = {
        name: form.name || '',
        description: form.description || '',
        category: form.category || '',
        image: form.image || undefined,
        price: form.price || undefined,
        duration: form.duration || undefined,
        location: form.location || undefined,
        schedule: form.schedule || undefined,
        isActive: form.isActive !== false,
        maxCapacity: form.maxCapacity || undefined,
        availableFrom: form.availableFrom || undefined,
        availableUntil: form.availableUntil || undefined,
        currency: form.currency || undefined,
      };
      if (isEdit) { const r = await container.services.update(initial!.id!, payload); setServices(prev => prev.map(s => s.id === r.id ? r : s)); }
      else { const r = await container.services.create(payload); setServices(prev => [r, ...prev]); }
    } else if (m.type === 'news') {
      const payload = {
        title: form.title || '',
        content: form.content || '',
        summary: form.summary || undefined,
        type: (form.type || 'noticia') as NewsType,
        image: form.image || undefined,
        eventDate: form.eventDate || undefined,
        location: form.location || undefined,
        isPublished: form.isPublished !== false,
      };
      if (isEdit) { const r = await container.news.update(initial!.id!, payload); setNews(prev => prev.map(n => n.id === r.id ? r : n)); }
      else { const r = await container.news.create(payload); setNews(prev => [r, ...prev]); }
    } else if (m.type === 'reservation') {
      const payload = {
        serviceId: form.serviceId || '',
        serviceName: form.serviceName || '',
        userName: form.userName || '',
        userEmail: form.userEmail || '',
        userPhone: form.userPhone || undefined,
        numberOfPeople: form.numberOfPeople || 1,
        preferredDate: form.preferredDate || undefined,
        message: form.message || undefined,
        status: (form.status || 'pendiente') as ReservationStatus,
      };
      if (isEdit) { const r = await container.reservations.update(initial!.id!, payload); setReservations(prev => prev.map(rs => rs.id === r.id ? r : rs)); }
      else { const r = await container.reservations.create(payload); setReservations(prev => [r, ...prev]); }
    } else if (m.type === 'chatbot') {
      const payload = {
        question: form.question || '',
        answer: form.answer || '',
        category: form.category || '',
        keywords: form.keywords || [],
        priority: form.priority ?? 0,
        isActive: form.isActive !== false,
      };
      if (isEdit) { const r = await container.chatbot.updateQuestion(initial!.id!, payload); setQuestions(prev => prev.map(q => q.id === r.id ? r : q)); }
      else { const r = await container.chatbot.createQuestion(payload); setQuestions(prev => [r, ...prev]); }
    } else if (m.type === 'attraction') {
      const payload = {
        name: form.name || '',
        description: form.description || '',
        category: form.category as AttractionCategory || 'otro',
        image: form.image || undefined,
        location: form.location || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        schedule: form.schedule || undefined,
        price: form.price || undefined,
        currency: form.currency || 'USD',
        duration: form.duration || undefined,
        isActive: form.isActive !== false,
      };
      if (isEdit) { const r = await container.attractions.update(initial!.id!, payload); setAttractions(prev => prev.map(a => a.id === r.id ? r : a)); }
      else { const r = await container.attractions.create(payload); setAttractions(prev => [r, ...prev]); }
    }

    setModal(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      if (type === 'service') { await container.services.delete(id); setServices(prev => prev.filter(s => s.id !== id)); }
      else if (type === 'news') { await container.news.delete(id); setNews(prev => prev.filter(n => n.id !== id)); }
      else if (type === 'reservation') { await container.reservations.delete(id); setReservations(prev => prev.filter(r => r.id !== id)); }
      else if (type === 'chatbot') { await container.chatbot.deleteQuestion(id); setQuestions(prev => prev.filter(q => q.id !== id)); }
      else if (type === 'attraction') { await container.attractions.delete(id); setAttractions(prev => prev.filter(a => a.id !== id)); }
      toast('Elemento eliminado correctamente', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar el elemento', 'error');
    }
    setDeleteId(null);
  };

  const updateReservationStatus = async (id: string, status: string) => {
    await container.reservations.updateStatus(id, status);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: status as ReservationStatus } : r));
  };

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', count: null as number | null, permission: null as string | null },
    { id: 'services', label: 'Servicios', count: services.length, permission: 'services:list' },
    { id: 'news', label: 'Noticias', count: news.length, permission: 'news:list' },
    { id: 'reservations', label: 'Reservas', count: reservations.length, permission: 'reservations:list' },
    { id: 'chatbot', label: 'FAQ Chatbot', count: questions.length, permission: 'chatbot:list' },
    { id: 'estadisticas', label: 'Estadísticas', count: null, permission: null },
    { id: 'pages', label: 'Páginas', count: 13, permission: 'organization:update' },
    { id: 'attractions', label: 'Atractivos', count: attractions.length, permission: 'attractions:list' },
    { id: 'reviews', label: 'Reseñas', count: null, permission: 'reviews:list' },

    { id: 'mensajes', label: 'Mensajes', count: unreadMessages, permission: 'contact:list' },
   // { id: 'activity', label: 'Activity Log', count: null, permission: 'audit:list' },
    { id: 'roles', label: 'Roles', count: null, permission: 'roles:list' },
  ];
  const tabs = user?.role === 'super_admin'
    ? allTabs
    : allTabs.filter(t => !t.permission || userPermissions.includes(t.permission));

  const pendingReservations = reservations.filter(r => r.status === 'pendiente').length;
  const activeServices = services.filter(s => s.isActive).length;
  const publishedNews = news.filter(n => n.isPublished).length;

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SEO title="Panel Administrativo" />
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 hidden md:flex flex-col`}>
        <div className={`h-16 flex items-center gap-3 px-4 border-b border-gray-100 ${sidebarOpen ? '' : 'justify-center'}`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
            </svg>
          </button>
          {sidebarOpen && <span className="font-bold text-gray-800 text-sm truncate">Admin</span>}
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {tabs.map((t, idx) => {
            const shortcut = idx < 10 ? `Ctrl+${idx === 9 ? 0 : idx + 1}` : null;
            return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative group ${
                tab === t.id
                  ? 'text-primary-700 bg-primary-50 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              } ${sidebarOpen ? '' : 'justify-center px-0'}`}
            >
              {tab === t.id && (
                <motion.div layoutId="activeTab" className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary-600 rounded-r" />
              )}
              <span className="flex-shrink-0">{tabIcons[t.id]}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{t.label}</span>
                  <div className="flex items-center gap-2">
                    {t.count !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tab === t.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                      }`}>{t.count}</span>
                    )}
                    {shortcut && (
                      <span className="text-[10px] text-gray-300 group-hover:text-gray-400 font-mono hidden lg:inline">{shortcut}</span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
          })}
        </nav>
        {sidebarOpen && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Ctrl + número para navegar rápido</span>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 min-w-0">
              <span className="font-semibold text-gray-800">Admin</span>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-gray-700 truncate">{tabLabels[tab] || tab}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-400 gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-xs text-gray-400">{services.length} servicios · {reservations.filter(r => r.status === 'pendiente').length} pendientes · {unreadMessages} mensajes</span>
            </div>
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5">
              <span className="text-xs text-gray-400">Bienvenido,</span>
              <span className="text-xs font-semibold text-gray-700">{user.firstName}</span>
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Ver sitio público">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              <span className="hidden lg:inline">Vista previa</span>
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cerrar Sesión">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </header>

        <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 bg-white border-b border-gray-200">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {tabIcons[t.id]}
              {t.label}
              {t.count !== null && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary-100' : 'bg-gray-100'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Cargando datos...</p>
                  </div>
                </div>
              ) : (
                <>
                  {tab === 'dashboard' && (
                    <DashboardTab
                      services={services} news={news} reservations={reservations}
                      questions={questions} adminUsers={adminUsers}
                      pageContent={pageContent} monthlyReservations={monthlyReservations}
                      topServices={topServices} loadData={loadData} openCreate={openCreate}
                      setTab={setTab} toast={toast}
                    />
                  )}
                  {tab === 'services' && (
                    <ServicesTab
                      services={services} pageContent={pageContent}
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      filterValue={filterValue} setFilterValue={setFilterValue}
                      openCreate={openCreate} openEdit={openEdit} setDeleteId={setDeleteId}
                    />
                  )}
                  {tab === 'news' && (
                    <NewsTab
                      news={news} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      filterValue={filterValue} setFilterValue={setFilterValue}
                      openCreate={openCreate} openEdit={openEdit} setDeleteId={setDeleteId}
                    />
                  )}
                  {tab === 'reservations' && (
                    <ReservationsTab
                      reservations={reservations} services={services}
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      filterValue={filterValue} setFilterValue={setFilterValue}
                      startDate={startDate} setStartDate={setStartDate}
                      endDate={endDate} setEndDate={setEndDate}
                      serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
                      openCreate={openCreate} openEdit={openEdit} setDeleteId={setDeleteId}
                      updateReservationStatus={updateReservationStatus}
                    />
                  )}
                  {tab === 'chatbot' && (
                    <ChatbotTab
                      questions={questions} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      filterValue={filterValue} setFilterValue={setFilterValue}
                      openCreate={openCreate} openEdit={openEdit} setDeleteId={setDeleteId}
                      onQuestionsUpdated={loadData}
                    />
                  )}
                  {tab === 'estadisticas' && (
                    <StatsTab
                      chatbotStats={chatbotStats} loadingStats={loadingStats}
                      setChatbotStats={setChatbotStats}
                    />
                  )}
                  {tab === 'attractions' && (
                    <AttractionsTab
                      attractions={attractions} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      filterValue={filterValue} setFilterValue={setFilterValue}
                      openCreate={openCreate} openEdit={openEdit} setDeleteId={setDeleteId}
                    />
                  )}
                  {tab === 'pages' && (
                    <PagesTab
                      org={org} orgForm={orgForm} setOrgForm={setOrgForm}
                      pageContent={pageContent} setPageContent={setPageContent}
                      logoUrl={logoUrl} setLogoUrl={setLogoUrl}
                      adminUsers={adminUsers} setAdminUsers={setAdminUsers}
                      user={user} toast={toast}
                    />
                  )}
                  {tab === 'reviews' && <ReviewsTab />}

                  {tab === 'roles' && <RolesTab />}
                  {tab === 'mensajes' && <ContactMessageTab key={contactRefresh} />}
                  {tab === 'activity' && <ActivityLogTab key={activityRefresh} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        <Modal open={!!modal} onClose={() => setModal(null)} onSave={handleSave}
          title={modal?.initial ? `Editar ${modal?.type === 'service' ? 'Servicio' : modal?.type === 'news' ? 'Noticia' : modal?.type === 'chatbot' ? 'Pregunta' : modal?.type === 'attraction' ? 'Atractivo Turístico' : 'Reserva'}` : `Nuevo ${modal?.type === 'service' ? 'Servicio' : modal?.type === 'news' ? 'Noticia' : modal?.type === 'chatbot' ? 'Pregunta' : modal?.type === 'attraction' ? 'Atractivo Turístico' : 'Reserva'}`}>
          {modal?.type === 'service' && <ServiceForm form={form} setForm={setForm} categories={pageContent.categories} />}
          {modal?.type === 'news' && <NewsForm form={form} setForm={setForm} />}
          {modal?.type === 'reservation' && <ReservationForm form={form} setForm={setForm} services={services} />}
          {modal?.type === 'chatbot' && <ChatbotForm form={form} setForm={setForm} />}
          {modal?.type === 'attraction' && <AttractionForm form={form} setForm={setForm} />}
        </Modal>
      </AnimatePresence>

      <AnimatePresence>
        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} onSave={async () => {
          if (deleteId) {
            const [type, id] = deleteId.split(':');
            await handleDelete(type, id);
          }
        }} title="Confirmar eliminación" submitLabel="Eliminar">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">¿Estás seguro de eliminar este elemento?</p>
              <p className="text-xs text-gray-500 mt-1">Esta acción no se puede deshacer. Los datos se eliminarán permanentemente.</p>
            </div>
          </div>
        </Modal>
      </AnimatePresence>
    </div>
  );
}
