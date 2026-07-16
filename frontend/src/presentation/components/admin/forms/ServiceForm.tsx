import ImageUpload from '../ImageUpload';

export interface AdminFormData {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  duration?: string;
  image?: string;
  location?: string;
  schedule?: string;
  isActive?: boolean;
  maxCapacity?: number;
  availableFrom?: string;
  availableUntil?: string;
  title?: string;
  content?: string;
  summary?: string;
  type?: string;
  eventDate?: string;
  isPublished?: boolean;
  dni?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  serviceId?: string;
  serviceName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: string;
  message?: string;
  question?: string;
  answer?: string;
  keywords?: string[];
  priority?: number;
  latitude?: number;
  longitude?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function ServiceForm({ form, setForm, categories }: {
  form: AdminFormData; setForm: (f: AdminFormData) => void;
  categories?: Array<{ name: string; label?: string }>;
}) {
  const cats = categories && categories.length > 0
    ? categories
    : [{ name: 'aventura' }, { name: 'hospedaje' }, { name: 'restaurante' }, { name: 'gastronomia' }, { name: 'cultura' }, { name: 'transporte' }, { name: 'paquete' }, { name: 'piscinas' }, { name: 'otro' }];
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Nombre *</label>
        <input required value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Descripción *</label>
        <textarea required rows={3} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Categoría *</label>
        <select required value={form.category || ''} onChange={(e) => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
          <option value="">Seleccionar...</option>
          {cats.map((c) => <option key={c.name} value={c.name}>{c.label || c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Precio ($)</label>
          <input type="number" min="0" step="0.01" value={form.price || ''} onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Duración</label>
          <input value={form.duration || ''} onChange={(e) => setForm({...form, duration: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: 3 horas" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Capacidad máxima</label>
          <input type="number" min="1" value={form.maxCapacity ?? ''} onChange={(e) => setForm({...form, maxCapacity: parseInt(e.target.value) || undefined})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Disponible desde</label>
          <input type="date" value={form.availableFrom || ''} onChange={(e) => setForm({...form, availableFrom: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Disponible hasta</label>
          <input type="date" value={form.availableUntil || ''} onChange={(e) => setForm({...form, availableUntil: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Imagen</label>
        <ImageUpload value={form.image || ''} onChange={(url) => setForm({...form, image: url})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Ubicación</label>
          <input value={form.location || ''} onChange={(e) => setForm({...form, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Horario</label>
          <input value={form.schedule || ''} onChange={(e) => setForm({...form, schedule: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
      </div>
      {form.id && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({...form, isActive: e.target.checked})}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-gray-700">Activo</span>
        </label>
      )}
    </>
  );
}
