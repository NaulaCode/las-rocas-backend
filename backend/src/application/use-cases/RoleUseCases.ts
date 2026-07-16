import { RoleRepository } from '../../domain/repositories/RoleRepository';
import { Role, RoleWithPermissions, CreateRoleData, UpdateRoleData } from '../../domain/entities/Role';
import { NotFoundError, ValidationError, ConflictError } from '../../domain/errors/AppError';

export class RoleUseCases {
  constructor(private roleRepository: RoleRepository) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: string): Promise<RoleWithPermissions> {
    const role = await this.roleRepository.findByIdWithPermissions(id);
    if (!role) throw new NotFoundError('Rol no encontrado');
    return role;
  }

  async create(data: CreateRoleData): Promise<Role> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('El nombre del rol es requerido');
    }
    const existing = await this.roleRepository.findByName(data.name);
    if (existing) throw new ConflictError('Ya existe un rol con ese nombre');
    return this.roleRepository.create({ ...data, name: data.name.trim() });
  }

  async update(id: string, data: UpdateRoleData): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError('Rol no encontrado');
    if (data.name) {
      const existing = await this.roleRepository.findByName(data.name);
      if (existing && existing.id !== id) throw new ConflictError('Ya existe un rol con ese nombre');
    }
    const updated = await this.roleRepository.update(id, data);
    if (!updated) throw new NotFoundError('Rol no encontrado');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError('Rol no encontrado');
    const deleted = await this.roleRepository.delete(id);
    if (!deleted) throw new ValidationError('No se pudo eliminar el rol');
  }

  async getAllPermissions(): Promise<{ id: string; name: string; module: string; action: string; label: string }[]> {
    return this.roleRepository.getAllPermissions();
  }
}
