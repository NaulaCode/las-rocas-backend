import type { AdminFormData } from './ServiceForm';

export function ChatbotForm({ form, setForm }: { form: AdminFormData; setForm: (f: AdminFormData) => void }) {
  const categories = ['general', 'servicios', 'eventos', 'reservas', 'contacto'];
  return (
    <>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Pregunta *</label>
        <textarea required rows={2} value={form.question || ''} onChange={(e) => setForm({...form, question: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Respuesta *</label>
        <textarea required rows={4} value={form.answer || ''} onChange={(e) => setForm({...form, answer: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Categoría *</label>
        <select required value={form.category || ''} onChange={(e) => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
          <option value="">Seleccionar...</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Keywords (separadas por coma)</label>
        <input value={(form.keywords || []).join(', ')} onChange={(e) => setForm({...form, keywords: e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean)})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: horario, atencion, abierto" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Prioridad</label>
          <input type="number" min="0" value={form.priority ?? 0} onChange={(e) => setForm({...form, priority: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer pt-6">
          <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({...form, isActive: e.target.checked})}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-gray-700">Activo</span>
        </label>
      </div>
    </>
  );
}
