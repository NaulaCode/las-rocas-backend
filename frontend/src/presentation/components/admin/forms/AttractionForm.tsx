import ImageUpload from '../ImageUpload';
import type { AdminFormData } from './ServiceForm';

export const attractionCategories = ['natural', 'cultural', 'aventura', 'gastronomico', 'historico', 'playa', 'montana', 'otro'];
export const attractionCategoryLabels: Record<string, string> = {
  natural: 'Naturaleza', cultural: 'Cultural', aventura: 'Aventura',
  gastronomico: 'Gastronómico', historico: 'Histórico', playa: 'Playa',
  montana: 'Montaña', otro: 'Otro',
};

export function AttractionForm({ form, setForm }: { form: AdminFormData; setForm: (f: AdminFormData) => void }) {
  return (
    <>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Nombre *</label>
        <input required value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Descripción *</label>
        <textarea required rows={3} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Categoría *</label>
        <select required value={form.category || ''} onChange={(e) => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
          <option value="">Seleccionar...</option>
          {attractionCategories.map((c) => <option key={c} value={c}>{attractionCategoryLabels[c]}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Precio (S/)</label>
          <input type="number" min="0" step="0.01" value={form.price || ''} onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Duración</label>
          <input value={form.duration || ''} onChange={(e) => setForm({...form, duration: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: 2 horas" />
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Imagen</label>
        <ImageUpload value={form.image || ''} onChange={(url) => setForm({...form, image: url})} />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Ubicación</label>
        <input value={form.location || ''} onChange={(e) => setForm({...form, location: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Latitud</label>
          <input type="number" step="any" value={form.latitude ?? ''} onChange={(e) => setForm({...form, latitude: e.target.value ? parseFloat(e.target.value) : undefined})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: -12.1234" />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Longitud</label>
          <input type="number" step="any" value={form.longitude ?? ''} onChange={(e) => setForm({...form, longitude: e.target.value ? parseFloat(e.target.value) : undefined})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: -77.1234" />
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Horario</label>
        <input value={form.schedule || ''} onChange={(e) => setForm({...form, schedule: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
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
