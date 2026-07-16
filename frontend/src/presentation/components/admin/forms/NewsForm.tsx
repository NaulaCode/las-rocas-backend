import ImageUpload from '../ImageUpload';
import type { AdminFormData } from './ServiceForm';

export function NewsForm({ form, setForm }: { form: AdminFormData; setForm: (f: AdminFormData) => void }) {
  const types = ['noticia', 'evento', 'festividad', 'actividad'];
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Título *</label>
        <input required value={form.title || ''} onChange={(e) => setForm({...form, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Contenido *</label>
        <textarea required rows={4} value={form.content || ''} onChange={(e) => setForm({...form, content: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Resumen</label>
        <textarea rows={2} value={form.summary || ''} onChange={(e) => setForm({...form, summary: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Tipo *</label>
        <select required value={form.type || ''} onChange={(e) => setForm({...form, type: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
          <option value="">Seleccionar...</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Imagen</label>
        <ImageUpload value={form.image || ''} onChange={(url) => setForm({...form, image: url})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Fecha del evento</label>
          <input type="date" value={form.eventDate || ''} onChange={(e) => setForm({...form, eventDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Ubicación</label>
          <input value={form.location || ''} onChange={(e) => setForm({...form, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isPublished !== false} onChange={(e) => setForm({...form, isPublished: e.target.checked})}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        <span className="text-sm text-gray-700">Publicado</span>
      </label>
    </>
  );
}
