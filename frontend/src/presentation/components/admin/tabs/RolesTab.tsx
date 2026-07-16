import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { container } from '../../../../di/container';
import { Role, Permission, RoleWithPermissions } from '../../../../domain/entities/Role';
import Modal from '../Modal';
import { RoleForm } from '../forms/RoleForm';
import { renderTable, actionButtons, searchInput, sortData } from '../AdminTable';
import { sectionVariants } from '../tabIcons';

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export default function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; role?: RoleWithPermissions } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<RoleFormData>({ name: '', description: '', permissionIds: [] });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      container.roles.getAll().catch(() => [] as Role[]),
      container.roles.getAllPermissions().catch(() => [] as Permission[]),
    ]);
    setRoles(r);
    setPermissions(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', permissionIds: [] });
    setModal({ type: 'create' });
  };

  const openEdit = async (role: Role) => {
    try {
      const roleWithPerms = await container.roles.getById(role.id);
      setForm({
        name: roleWithPerms.name,
        description: roleWithPerms.description || '',
        permissionIds: roleWithPerms.permissions.map(p => p.id),
      });
      setModal({ type: 'edit', role: roleWithPerms });
    } catch {
      alert('Error al cargar el rol');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal?.type === 'create') {
        const created = await container.roles.create({
          name: form.name,
          description: form.description || undefined,
          permissionIds: form.permissionIds,
        });
        setRoles(prev => [...prev, created]);
      } else if (modal?.type === 'edit' && modal.role) {
        const updated = await container.roles.update(modal.role.id, {
          name: form.name,
          description: form.description || undefined,
          permissionIds: form.permissionIds,
        });
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
      }
      setModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await container.roles.delete(deleteId);
      setRoles(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const getPermissionCount = (role: Role) => {
    return 'Se desconoce';
  };

  const filtered = roles.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
  });

  const rows = filtered.map((r) => (
    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.description || '-'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          {r.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-4 py-3">
        {actionButtons(
          () => openEdit(r),
          () => setDeleteId(r.id),
        )}
      </td>
    </tr>
  ));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Roles y Permisos</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <div className="mb-4 max-w-xs">
        {searchInput(searchTerm, setSearchTerm, 'Buscar roles...')}
      </div>

      {renderTable(
        ['Nombre', 'Descripción', 'Estado', 'Acciones'],
        rows,
      )}

      <AnimatePresence>
        <Modal open={!!modal} onClose={() => setModal(null)} onSave={handleSave}
          title={modal?.type === 'create' ? 'Nuevo Rol' : 'Editar Rol'} submitLabel={saving ? 'Guardando...' : 'Guardar'}>
          <RoleForm form={form} setForm={setForm} permissions={permissions} />
        </Modal>
      </AnimatePresence>

      <AnimatePresence>
        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} onSave={handleDelete}
          title="Confirmar eliminación" submitLabel="Eliminar">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">¿Estás seguro de eliminar este rol?</p>
              <p className="text-xs text-gray-500 mt-1">Los usuarios asignados a este rol quedarán sin permisos RBAC.</p>
            </div>
          </div>
        </Modal>
      </AnimatePresence>
    </motion.div>
  );
}
