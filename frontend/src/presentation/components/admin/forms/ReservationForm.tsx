import type { AdminFormData } from './ServiceForm';
import type { TouristicService } from '../../../../domain/entities/TouristicService';

export function ReservationForm({ form, setForm, services }: { form: AdminFormData; setForm: (f: AdminFormData) => void; services: TouristicService[] }) {
  const isEdit = !!form.id;
  return (
    <>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Servicio *</label>
        <select required value={form.serviceId || ''} onChange={(e) => {
          const s = services.find(s => s.id === e.target.value);
          setForm({...form, serviceId: e.target.value, serviceName: s?.name || ''});
        }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
          <option value="">Seleccionar...</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Nombre del cliente *</label>
          <input required value={form.userName || ''} onChange={(e) => setForm({...form, userName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
          <input type="email" required value={form.userEmail || ''} onChange={(e) => setForm({...form, userEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Teléfono</label>
          <input value={form.userPhone || ''} onChange={(e) => setForm({...form, userPhone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Personas</label>
          <input type="number" min="1" value={form.numberOfPeople || 1} onChange={(e) => setForm({...form, numberOfPeople: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Fecha preferida</label>
        <input type="date" value={form.preferredDate || ''} onChange={(e) => setForm({...form, preferredDate: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Mensaje</label>
        <textarea rows={3} value={form.message || ''} onChange={(e) => setForm({...form, message: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" />
      </div>
      {isEdit && (
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
          <select value={form.status || 'pendiente'} onChange={(e) => setForm({...form, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      )}
    </>
  );
}
