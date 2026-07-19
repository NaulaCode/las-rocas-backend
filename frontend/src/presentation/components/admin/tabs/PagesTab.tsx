import { useState, useEffect } from 'react';
import { Organization, PageContent } from '../../../../domain/entities/Organization';
import { PublicUser } from '../../../../domain/entities/User';
import { User } from '../../../../domain/entities/User';
import { Role } from '../../../../domain/entities/Role';
import ImageUpload from '../ImageUpload';
import { container } from '../../../../di/container';
import SEO from '../../SEO';

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      )}
    </div>
  );
}

interface Props {
  org: Organization | null;
  orgForm: Record<string, string>;
  setOrgForm: (f: Record<string, string>) => void;
  pageContent: PageContent;
  setPageContent: (p: PageContent) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  adminUsers: PublicUser[];
  setAdminUsers: (users: PublicUser[]) => void;
  user: User | null;
  toast: any;
}

const pageSubTabs = ['general', 'home', 'servicios', 'atractivos', 'noticias', 'conocenos', 'contacto', 'galeria', 'categorias', 'resenas', 'notificaciones', 'fechas-bloqueadas', 'usuarios-admin'];

const subTabLabels: Record<string, string> = {
  general: 'General', home: 'Inicio', servicios: 'Servicios', atractivos: 'Atractivos',
  noticias: 'Noticias', conocenos: 'Conócenos', contacto: 'Contacto',
  galeria: 'Galería', categorias: 'Categorías', resenas: 'Reseñas',
  notificaciones: 'Notificaciones', 'fechas-bloqueadas': 'Fechas Bloqueadas', 'usuarios-admin': 'Usuarios Admin',
};

export default function PagesTab({ org, orgForm, setOrgForm, pageContent, setPageContent, logoUrl, setLogoUrl, adminUsers, setAdminUsers, user, toast: t }: Props) {
  const [subTab, setSubTab] = useState('general');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifStart, setNotifStart] = useState('');
  const [notifEnd, setNotifEnd] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleId, setNewRoleId] = useState('');

  useEffect(() => {
    container.roles.getAll().then(setRoles).catch(() => {});
  }, []);

  const updatePC = (key: string, value: any) => {
    setPageContent({ ...pageContent, [key]: value });
  };

  const handleSave = async () => {
    try {
      await container.organization.update({ ...orgForm, logo: logoUrl, pageContent } as any);
      t('Cambios guardados exitosamente', 'success');
    } catch {
      t('Error al guardar los cambios', 'error');
    }
  };

  const renderSubTabs = () => (
    <div className="flex overflow-x-auto gap-1 mb-6 pb-2 border-b border-gray-200">
      {pageSubTabs.map((st) => (
        <button key={st} onClick={() => setSubTab(st)}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            subTab === st ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}>{subTabLabels[st]}</button>
      ))}
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Logo de la Organización</h3>
        <ImageUpload value={logoUrl} onChange={setLogoUrl} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre Comercial" value={orgForm.name || ''} onChange={(v) => setOrgForm({...orgForm, name: v})} />
          <Field label="Razón Social" value={orgForm.legalName || ''} onChange={(v) => setOrgForm({...orgForm, legalName: v})} />
          <Field label="RUC" value={orgForm.ruc || ''} onChange={(v) => setOrgForm({...orgForm, ruc: v})} />
          <Field label="Teléfono" value={orgForm.phone || ''} onChange={(v) => setOrgForm({...orgForm, phone: v})} />
          <Field label="Email" value={orgForm.email || ''} onChange={(v) => setOrgForm({...orgForm, email: v})} />
          <Field label="Sitio Web" value={orgForm.website || ''} onChange={(v) => setOrgForm({...orgForm, website: v})} />
          <Field label="Dirección" value={orgForm.address || ''} onChange={(v) => setOrgForm({...orgForm, address: v})} />
        </div>
        <div className="mt-4">
          <Field label="Descripción" value={orgForm.description || ''} onChange={(v) => setOrgForm({...orgForm, description: v})} type="textarea" />
        </div>
        <div className="mt-4">
          <Field label="Historia" value={orgForm.history || ''} onChange={(v) => setOrgForm({...orgForm, history: v})} type="textarea" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Misión" value={orgForm.mission || ''} onChange={(v) => setOrgForm({...orgForm, mission: v})} type="textarea" />
          <Field label="Visión" value={orgForm.vision || ''} onChange={(v) => setOrgForm({...orgForm, vision: v})} type="textarea" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Imagen de Portada</h3>
        <ImageUpload value={orgForm.coverImage || ''} onChange={(v) => setOrgForm({...orgForm, coverImage: v})} />
      </div>
    </div>
  );

  const renderHomeTab = () => {
    const home = pageContent.home || {};
    const whyChoose = home.whyChoose || [];

    const setHome = (key: string, value: any) => updatePC('home', { ...home, [key]: value });

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Hero Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Título" value={home.heroTitle || ''} onChange={(v) => setHome('heroTitle', v)} />
            <Field label="Texto Botón Reservar" value={home.heroCtaText || ''} onChange={(v) => setHome('heroCtaText', v)} />
            <Field label="Texto Botón Secundario" value={home.heroCta2Text || ''} onChange={(v) => setHome('heroCta2Text', v)} />
            <div className="md:col-span-2">
              <Field label="Link Botón Reservar" value={home.heroCtaLink || ''} onChange={(v) => setHome('heroCtaLink', v)} />
            </div>
            <div className="md:col-span-2">
              <Field label="Link Botón Secundario" value={home.heroCta2Link || ''} onChange={(v) => setHome('heroCta2Link', v)} />
            </div>
            <div className="md:col-span-2">
              <Field label="Subtítulo" value={home.heroSubtitle || ''} onChange={(v) => setHome('heroSubtitle', v)} type="textarea" />
            </div>
            <Field label="URL Imagen Hero" value={home.heroImage || ''} onChange={(v) => setHome('heroImage', v)} />
            <Field label="URL Video YouTube (opcional)" value={home.heroVideoUrl || ''} onChange={(v) => setHome('heroVideoUrl', v)} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sección de Bienvenida</h3>
          <Field label="Título" value={home.aboutTitle || ''} onChange={(v) => setHome('aboutTitle', v)} />
          <div className="mt-4">
            <Field label="Párrafo 1" value={home.aboutText1 || ''} onChange={(v) => setHome('aboutText1', v)} type="textarea" />
          </div>
          <div className="mt-4">
            <Field label="Párrafo 2" value={home.aboutText2 || ''} onChange={(v) => setHome('aboutText2', v)} type="textarea" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">¿Por qué elegir Las Rocas?</h3>
          {whyChoose.map((w: any, i: number) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <input value={w.title || ''} onChange={(e) => { const nw = [...whyChoose]; nw[i] = { ...nw[i], title: e.target.value }; setHome('whyChoose', nw); }}
                className="w-1/3 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Título" />
              <input value={w.text || ''} onChange={(e) => { const nw = [...whyChoose]; nw[i] = { ...nw[i], text: e.target.value }; setHome('whyChoose', nw); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Texto" />
              <button onClick={() => { const nw = whyChoose.filter((_: any, j: number) => j !== i); setHome('whyChoose', nw); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => setHome('whyChoose', [...whyChoose, { title: '', text: '' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Pilar</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sección Servicios Destacados</h3>
          <Field label="Título" value={home.servicesTitle || ''} onChange={(v) => setHome('servicesTitle', v)} />
          <div className="mt-4">
            <Field label="Subtítulo" value={home.servicesSubtitle || ''} onChange={(v) => setHome('servicesSubtitle', v)} type="textarea" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sección Noticias</h3>
          <Field label="Título" value={home.newsTitle || ''} onChange={(v) => setHome('newsTitle', v)} />
          <div className="mt-4">
            <Field label="Subtítulo" value={home.newsSubtitle || ''} onChange={(v) => setHome('newsSubtitle', v)} type="textarea" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sección Galería</h3>
          <Field label="Título" value={home.galleryTitle || ''} onChange={(v) => setHome('galleryTitle', v)} />
          <div className="mt-4">
            <Field label="Texto" value={home.galleryText || ''} onChange={(v) => setHome('galleryText', v)} type="textarea" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Llamado Final (CTA)</h3>
          <Field label="Título" value={home.ctaTitle || ''} onChange={(v) => setHome('ctaTitle', v)} />
          <div className="mt-4">
            <Field label="Texto" value={home.ctaText || ''} onChange={(v) => setHome('ctaText', v)} type="textarea" />
          </div>
        </div>
      </div>
    );
  };

  const renderConocenosTab = () => {
    const conocenos = pageContent.conocenos || {};
    const values = conocenos.values || [];
    const stats = conocenos.stats || [];
    const activities = conocenos.activities || [];

    const setConocenos = (key: string, value: any) => updatePC('conocenos', { ...conocenos, [key]: value });

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Hero</h3>
          <Field label="Título" value={conocenos.title || ''} onChange={(v) => setConocenos('title', v)} />
          <div className="mt-4">
            <Field label="Subtítulo" value={conocenos.heroSubtitle || ''} onChange={(v) => setConocenos('heroSubtitle', v)} type="textarea" />
          </div>
          <div className="mt-4">
            <Field label="Descripción" value={conocenos.description || ''} onChange={(v) => setConocenos('description', v)} type="textarea" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Valores</h3>
          {values.map((v: any, i: number) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <input value={v.icon || ''} onChange={(e) => { const nv = [...values]; nv[i] = { ...nv[i], icon: e.target.value }; setConocenos('values', nv); }}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Icono" />
              <input value={v.title || ''} onChange={(e) => { const nv = [...values]; nv[i] = { ...nv[i], title: e.target.value }; setConocenos('values', nv); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Título" />
              <input value={v.desc || ''} onChange={(e) => { const nv = [...values]; nv[i] = { ...nv[i], desc: e.target.value }; setConocenos('values', nv); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Texto" />
              <button onClick={() => { const nv = values.filter((_: any, j: number) => j !== i); setConocenos('values', nv); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => setConocenos('values', [...values, { icon: '', title: '', desc: '' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Valor</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Estadísticas</h3>
          {stats.map((s: any, i: number) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <input value={s.value || ''} onChange={(e) => { const ns = [...stats]; ns[i] = { ...ns[i], value: e.target.value }; setConocenos('stats', ns); }}
                className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Número" />
              <input value={s.label || ''} onChange={(e) => { const ns = [...stats]; ns[i] = { ...ns[i], label: e.target.value }; setConocenos('stats', ns); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Etiqueta" />
              <button onClick={() => { const ns = stats.filter((_: any, j: number) => j !== i); setConocenos('stats', ns); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => setConocenos('stats', [...stats, { value: '', label: '' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Estadística</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">¿Qué nos hace diferentes?</h3>
          <Field label="Contenido" value={conocenos.differentSection || ''} onChange={(v) => setConocenos('differentSection', v)} type="textarea" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Actividades</h3>
          {activities.map((a: any, i: number) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <input value={a.title || ''} onChange={(e) => { const na = [...activities]; na[i] = { ...na[i], title: e.target.value }; setConocenos('activities', na); }}
                className="w-1/3 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Título" />
              <input value={a.text || ''} onChange={(e) => { const na = [...activities]; na[i] = { ...na[i], text: e.target.value }; setConocenos('activities', na); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Texto" />
              <button onClick={() => { const na = activities.filter((_: any, j: number) => j !== i); setConocenos('activities', na); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => setConocenos('activities', [...activities, { title: '', text: '' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Actividad</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nuestro Compromiso</h3>
          <Field label="Texto" value={conocenos.commitmentText || ''} onChange={(v) => setConocenos('commitmentText', v)} type="textarea" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Invitación Final</h3>
          <Field label="Título" value={conocenos.invitationTitle || ''} onChange={(v) => setConocenos('invitationTitle', v)} />
          <div className="mt-4">
            <Field label="Texto" value={conocenos.invitationText || ''} onChange={(v) => setConocenos('invitationText', v)} type="textarea" />
          </div>
        </div>
      </div>
    );
  };

  const renderContactoTab = () => {
    const contacto = pageContent.contacto || {};
    const socialMedia = contacto.socialMedia || [];
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Teléfono" value={contacto.phone || ''} onChange={(v) => updatePC('contacto', { ...contacto, phone: v })} />
            <Field label="Número WhatsApp" value={contacto.whatsappNumber || ''} onChange={(v) => updatePC('contacto', { ...contacto, whatsappNumber: v })} placeholder="Ej: 593999123456 (sin +)" />
            <Field label="Email" value={contacto.email || ''} onChange={(v) => updatePC('contacto', { ...contacto, email: v })} />
            <Field label="Dirección" value={contacto.address || ''} onChange={(v) => updatePC('contacto', { ...contacto, address: v })} />
            <Field label="Horario" value={contacto.schedule || ''} onChange={(v) => updatePC('contacto', { ...contacto, schedule: v })} />
          </div>
          <div className="mt-4">
            <Field label="Mapa (URL embebida)" value={contacto.mapUrl || ''} onChange={(v) => updatePC('contacto', { ...contacto, mapUrl: v })} type="textarea" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Redes Sociales</h3>
          {socialMedia.map((s: any, i: number) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <input value={s.platform || ''} onChange={(e) => { const ns = [...socialMedia]; ns[i] = { ...ns[i], platform: e.target.value }; updatePC('contacto', { ...contacto, socialMedia: ns }); }}
                className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Plataforma" />
              <input value={s.url || ''} onChange={(e) => { const ns = [...socialMedia]; ns[i] = { ...ns[i], url: e.target.value }; updatePC('contacto', { ...contacto, socialMedia: ns }); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="URL" />
              <input value={s.icon || ''} onChange={(e) => { const ns = [...socialMedia]; ns[i] = { ...ns[i], icon: e.target.value }; updatePC('contacto', { ...contacto, socialMedia: ns }); }}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Icono" />
              <button onClick={() => { const ns = socialMedia.filter((_: any, j: number) => j !== i); updatePC('contacto', { ...contacto, socialMedia: ns }); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
          <button onClick={() => updatePC('contacto', { ...contacto, socialMedia: [...socialMedia, { platform: '', url: '', icon: '' }] })}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Red Social</button>
        </div>
      </div>
    );
  };

  const renderGaleriaTab = () => {
    const gallery = pageContent.gallery || [];
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Galería</h3>
          <button onClick={() => updatePC('gallery', [...gallery, { url: '', caption: '', type: 'image' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((item: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              {item.url ? (
                item.type === 'video' ? (
                  <div className="w-full h-24 bg-gray-900 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                ) : (
                  <img src={item.url} alt={item.caption || ''} className="w-full h-24 object-cover rounded-lg mb-2" loading="lazy" />
                )
              ) : (
                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="mb-1">
                <ImageUpload value={item.url || ''} onChange={(url) => { const ng = [...gallery]; ng[i] = { ...ng[i], url }; updatePC('gallery', ng); }} />
              </div>
              <input value={item.caption || ''} onChange={(e) => { const ng = [...gallery]; ng[i] = { ...ng[i], caption: e.target.value }; updatePC('gallery', ng); }}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs mb-1" placeholder="Descripción" />
              <select value={item.type || 'image'} onChange={(e) => { const ng = [...gallery]; ng[i] = { ...ng[i], type: e.target.value }; updatePC('gallery', ng); }}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs mb-2 bg-white">
                <option value="image">Imagen</option>
                <option value="video">Video directo</option>
                <option value="youtube">YouTube</option>
              </select>
              <button onClick={() => { const ng = gallery.filter((_: any, j: number) => j !== i); updatePC('gallery', ng); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCategoriasTab = () => {
    const categories = pageContent.categories || [];
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Categorías de Servicios</h3>
          <button onClick={() => updatePC('categories', [...categories, { name: '', label: '', icon: '', gradient: '' }])}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Agregar Categoría</button>
        </div>
        <div className="space-y-3">
          {categories.map((c: any, i: number) => (
            <div key={i} className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg">
              <input value={c.name || ''} onChange={(e) => { const nc = [...categories]; nc[i] = { ...nc[i], name: e.target.value }; updatePC('categories', nc); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Nombre (slug)" />
              <input value={c.label || ''} onChange={(e) => { const nc = [...categories]; nc[i] = { ...nc[i], label: e.target.value }; updatePC('categories', nc); }}
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Etiqueta" />
              <input value={c.icon || ''} onChange={(e) => { const nc = [...categories]; nc[i] = { ...nc[i], icon: e.target.value }; updatePC('categories', nc); }}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Icono" />
              <input value={c.gradient || ''} onChange={(e) => { const nc = [...categories]; nc[i] = { ...nc[i], gradient: e.target.value }; updatePC('categories', nc); }}
                className="w-28 px-2 py-1.5 border border-gray-200 rounded text-sm" placeholder="Gradient" />
              <button onClick={() => { const nc = categories.filter((_: any, j: number) => j !== i); updatePC('categories', nc); }}
                className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResenasTab = () => {
    const reviews = pageContent.reviews || [];
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Moderación de Reseñas</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            <p className="text-sm font-medium">No hay reseñas</p>
          </div>
        ) : (
          reviews.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800">{r.name}</span>
                    <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                    {r.serviceName && <span className="text-xs text-gray-400">· {r.serviceName}</span>}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{r.text}</p>
                  {r.role && <p className="text-xs text-gray-400 mt-1">{r.role}</p>}
                </div>
                <div className="flex gap-2">
                  {!r.approved && (
                    <button onClick={() => { const nr = reviews.map((rv: any) => rv.id === r.id ? { ...rv, approved: true } : rv); updatePC('reviews', nr); }}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">Aprobar</button>
                  )}
                  <button onClick={() => updatePC('reviews', reviews.filter((rv: any) => rv.id !== r.id))}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Eliminar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderNotificacionesTab = () => {
    const notifications = pageContent.notifications || [];
    return (
      <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Crear Notificación</h3>
            <div className="space-y-3">
              <input value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Mensaje de la notificación..." />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input type="datetime-local" value={notifStart} onChange={(e) => setNotifStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input type="datetime-local" value={notifEnd} onChange={(e) => setNotifEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
              </div>
              <button onClick={() => {
                if (!notifMessage.trim()) return;
                const nn = [...notifications, {
                  id: Date.now().toString(),
                  message: notifMessage,
                  date: new Date().toISOString(),
                  active: true,
                  startDate: notifStart || undefined,
                  endDate: notifEnd || undefined,
                }];
                updatePC('notifications', nn);
                setNotifMessage('');
                setNotifStart('');
                setNotifEnd('');
              }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Publicar</button>
            </div>
          </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Notificaciones Activas</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hay notificaciones</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.startDate ? `${new Date(n.startDate).toLocaleDateString()} ${new Date(n.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Sin fecha inicio'}
                      {n.endDate ? ` → ${new Date(n.endDate).toLocaleDateString()} ${new Date(n.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const nn = notifications.map((not: any) => not.id === n.id ? { ...not, active: !not.active } : not); updatePC('notifications', nn); }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${n.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>{n.active ? 'Activa' : 'Inactiva'}</button>
                    <button onClick={() => updatePC('notifications', notifications.filter((not: any) => not.id !== n.id))}
                      className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFechasBloqueadasTab = () => {
    const blockedDates = pageContent.blockedDates || [];
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Bloquear Fecha</h3>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
              <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Razón</label>
              <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Motivo del bloqueo..." />
            </div>
            <button onClick={() => { if (!blockDate) return; const nb = [...blockedDates, { id: Date.now().toString(), date: blockDate, reason: blockReason, createdAt: new Date().toISOString() }]; updatePC('blockedDates', nb); setBlockDate(''); setBlockReason(''); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap">Bloquear</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Fechas Bloqueadas</h3>
          {blockedDates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hay fechas bloqueadas</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd: any) => (
                <div key={bd.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{new Date(bd.date).toLocaleDateString()}</p>
                    {bd.reason && <p className="text-xs text-gray-400">{bd.reason}</p>}
                  </div>
                  <button onClick={() => updatePC('blockedDates', blockedDates.filter((d: any) => d.id !== bd.id))}
                    className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsuariosAdminTab = () => {
    const resetForm = () => {
      setNewEmail(''); setNewPass(''); setNewFirstName(''); setNewLastName('');
      setEditingUser(null); setShowAdminForm(false); setChangePassword(false); setNewRoleId('');
    };

    const handleCreateUser = async () => {
      try {
        const created = await container.auth.register({ email: newEmail, password: newPass, firstName: newFirstName, lastName: newLastName, role: 'admin', roleId: newRoleId || undefined });
        setAdminUsers([...adminUsers, created.user as PublicUser]);
        t('Usuario admin creado exitosamente', 'success');
        resetForm();
      } catch { t('Error al crear usuario', 'error'); }
    };

    const handleEditUser = async () => {
      if (!editingUser) return;
      try {
        const payload: Record<string, any> = { firstName: newFirstName, lastName: newLastName, email: newEmail };
        if (changePassword && newPass) payload.password = newPass;
        if (newRoleId) payload.roleId = newRoleId;
        await container.auth.updateUser(editingUser.id, payload);
        setAdminUsers(adminUsers.map((u) => u.id === editingUser.id ? { ...u, firstName: newFirstName, lastName: newLastName, email: newEmail } : u));
        t('Usuario actualizado exitosamente', 'success');
        resetForm();
      } catch { t('Error al actualizar usuario', 'error'); }
    };

    const handleToggleActive = async (u: PublicUser) => {
      try {
        await container.auth.updateUser(u.id, { isActive: !u.isActive } as any);
        setAdminUsers(adminUsers.map((au) => au.id === u.id ? { ...au, isActive: !au.isActive } : au));
        t(u.isActive ? 'Usuario desactivado' : 'Usuario activado', 'success');
      } catch { t('Error al cambiar estado', 'error'); }
    };

    const handleDeleteUser = async (u: PublicUser) => {
      try {
        await container.auth.deleteUser(u.id);
        setAdminUsers(adminUsers.filter((au) => au.id !== u.id));
        t('Usuario eliminado exitosamente', 'success');
      } catch { t('Error al eliminar usuario', 'error'); }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Usuarios Administradores</h3>
          <button onClick={() => { resetForm(); setShowAdminForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Admin
          </button>
        </div>

        {showAdminForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{editingUser ? 'Editar Admin' : 'Nuevo Admin'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre" value={newFirstName} onChange={setNewFirstName} />
              <Field label="Apellido" value={newLastName} onChange={setNewLastName} />
              <Field label="Email" value={newEmail} onChange={setNewEmail} />
              {!editingUser ? (
                <Field label="Contraseña" value={newPass} onChange={setNewPass} type="password" />
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    Cambiar contraseña
                  </label>
                  {changePassword && <Field label="Nueva contraseña" value={newPass} onChange={setNewPass} type="password" />}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol (RBAC)</label>
                <select value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
                  <option value="">Sin rol (solo rol legacy)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={editingUser ? handleEditUser : handleCreateUser}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">{editingUser ? 'Guardar' : 'Crear'}</button>
              <button onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminUsers.map((u) => {
                const roleName = u.roleId ? roles.find(r => r.id === u.roleId)?.name : null;
                return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {roleName || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingUser(u); setNewFirstName(u.firstName); setNewLastName(u.lastName); setNewEmail(u.email); setNewRoleId(u.roleId || ''); setShowAdminForm(true); }}
                        className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleToggleActive(u)}
                        className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`} title={u.isActive ? 'Desactivar' : 'Activar'}>
                        {u.isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPageContentTab = (pageKey: string, label: string) => {
    const content = pageContent[pageKey] || {};
    const setContent = (key: string, value: any) => updatePC(pageKey, { ...content, [key]: value });
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Hero de {label}</h3>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Título del Hero" value={content.heroTitle || content.title || ''} onChange={(v) => { setContent('heroTitle', v); setContent('title', v); }} />
            <Field label="Subtítulo del Hero" value={content.heroSubtitle || content.subtitle || ''} onChange={(v) => { setContent('heroSubtitle', v); setContent('subtitle', v); }} type="textarea" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Imagen de Portada</h3>
          <p className="text-xs text-gray-400 mb-3">Imagen de fondo del encabezado de la página de {label.toLowerCase()}</p>
          <ImageUpload value={content.coverImage || ''} onChange={(v) => setContent('coverImage', v)} />
        </div>
      </div>
    );
  };

  const renderSubTabContent = () => {
    switch (subTab) {
      case 'general': return renderGeneralTab();
      case 'home': return renderHomeTab();
      case 'servicios': return renderPageContentTab('services', 'Servicios');
      case 'atractivos': return renderPageContentTab('attractions', 'Atractivos');
      case 'noticias': return renderPageContentTab('news', 'Noticias');
      case 'conocenos': return renderConocenosTab();
      case 'contacto': return renderContactoTab();
      case 'galeria': return renderGaleriaTab();
      case 'categorias': return renderCategoriasTab();
      case 'resenas': return renderResenasTab();
      case 'notificaciones': return renderNotificacionesTab();
      case 'fechas-bloqueadas': return renderFechasBloqueadasTab();
      case 'usuarios-admin': return renderUsuariosAdminTab();
      default: return null;
    }
  };

  return (
    <div>
      <SEO title="Administrar Páginas" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Administrar Páginas</h2>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Guardar Cambios
        </button>
      </div>
      {renderSubTabs()}
      {renderSubTabContent()}
    </div>
  );
}
