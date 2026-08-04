import { useState } from 'react';
import type { AdminFormData } from './ServiceForm';
import type { TouristicService } from '../../../../domain/entities/TouristicService';
import { isValidEmail, isValidPhone } from '../../../utils/validation';

export function validateReservationForm(form: AdminFormData): { email?: string; phone?: string } {
  const errors: { email?: string; phone?: string } = {};
  if (!form.userEmail?.trim()) errors.email = 'El email es requerido';
  else if (!isValidEmail(form.userEmail)) errors.email = 'Email inválido';
  if (form.userPhone?.trim() && !isValidPhone(form.userPhone)) errors.phone = 'Número de teléfono inválido';
  return errors;
}

export function ReservationForm({ form, setForm, services, errors }: { form: AdminFormData; setForm: (f: AdminFormData) => void; services: TouristicService[]; errors?: { email?: string; phone?: string } }) {
  const isEdit = !!form.id;
  const fieldErrors = errors || {};

  const inputClass = (hasError?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100'}`;

  return (
    <>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Servicio *</label>
        <select required value={form.serviceId || ''} onChange={(e) => {
          const s = services.find(s => s.id === e.target.value);
          setForm({...form, serviceId: e.target.value, serviceName: s?.name || ''});
        }} className={inputClass()}>
          <option value="">Seleccionar...</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Nombre del cliente *</label>
          <input required value={form.userName || ''} onChange={(e) => setForm({...form, userName: e.target.value})}
            className={inputClass()} />
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
          <input type="email" required value={form.userEmail || ''} onChange={(e) => setForm({...form, userEmail: e.target.value})}
            className={inputClass(fieldErrors.email)} />
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Teléfono</label>
          <input type="tel" value={form.userPhone || ''} onChange={(e) => setForm({...form, userPhone: e.target.value})}
            className={inputClass(fieldErrors.phone)} />
          {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
        </div>
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Personas</label>
          <input type="number" min="1" value={form.numberOfPeople || 1} onChange={(e) => setForm({...form, numberOfPeople: parseInt(e.target.value) || 1})}
            className={inputClass()} />
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Fecha preferida</label>
        <input type="date" value={form.preferredDate || ''} onChange={(e) => setForm({...form, preferredDate: e.target.value})}
          className={inputClass()} />
      </div>
      <div><label className="block text-sm font-medium mb-1 text-gray-700">Mensaje</label>
        <textarea rows={3} value={form.message || ''} onChange={(e) => setForm({...form, message: e.target.value})}
          className={inputClass()} />
      </div>
      {isEdit && (
        <div><label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
          <select value={form.status || 'pendiente'} onChange={(e) => setForm({...form, status: e.target.value})}
            className={inputClass()}>
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
