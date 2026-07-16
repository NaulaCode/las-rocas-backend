import { useState } from 'react';
import { Permission } from '../../../../domain/entities/Role';

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

interface Props {
  form: RoleFormData;
  setForm: (f: RoleFormData) => void;
  permissions: Permission[];
}

const moduleLabels: Record<string, string> = {
  users: 'Usuarios',
  services: 'Servicios Turísticos',
  news: 'Noticias',
  attractions: 'Atractivos Turísticos',
  reservations: 'Reservaciones',
  chatbot: 'FAQ Chatbot',
  contact: 'Mensajes de Contacto',
  reviews: 'Reseñas',

  organization: 'Organización',
  roles: 'Roles',
  audit: ' Auditoría',
  uploads: 'Archivos',
};

const moduleOrder = [
  'services', 'news', 'attractions', 'reservations', 'chatbot',
  'users', 'contact', 'reviews', 'organization',
  'roles', 'audit', 'uploads',
];

export function RoleForm({ form, setForm, permissions }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const modules = moduleOrder
    .map(m => ({
      module: m,
      label: moduleLabels[m] || m,
      perms: permissions.filter(p => p.module === m),
    }))
    .filter(m => m.perms.length > 0);

  const togglePerm = (permId: string) => {
    const has = form.permissionIds.includes(permId);
    setForm({
      ...form,
      permissionIds: has
        ? form.permissionIds.filter(id => id !== permId)
        : [...form.permissionIds, permId],
    });
  };

  const toggleModule = (moduleName: string, permIds: string[]) => {
    const allSelected = permIds.every(id => form.permissionIds.includes(id));
    setForm({
      ...form,
      permissionIds: allSelected
        ? form.permissionIds.filter(id => !permIds.includes(id))
        : [...form.permissionIds.filter(id => !permIds.includes(id)), ...permIds],
    });
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Nombre del Rol *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Ej: Editor de Contenido" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Descripción</label>
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Descripción del rol" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Permisos</label>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {modules.map((mod) => {
            const selectedCount = mod.perms.filter(p => form.permissionIds.includes(p.id)).length;
            const totalCount = mod.perms.length;
            const isCollapsed = collapsed[mod.module];
            return (
              <div key={mod.module} className="border border-gray-200 rounded-lg overflow-hidden">
                <button type="button" onClick={() => setCollapsed({ ...collapsed, [mod.module]: !isCollapsed })}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{mod.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{selectedCount}/{totalCount}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleModule(mod.module, mod.perms.map(p => p.id)); }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-0.5 rounded hover:bg-primary-50 transition-colors">
                      {selectedCount === totalCount ? 'Deseleccionar' : 'Seleccionar'}
                    </button>
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="px-3 py-2 space-y-1.5">
                    {mod.perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input type="checkbox" checked={form.permissionIds.includes(p.id)} onChange={() => togglePerm(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm text-gray-700">{p.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
