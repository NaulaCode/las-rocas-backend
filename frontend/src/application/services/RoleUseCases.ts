import { IRoleRepository } from '../../domain/ports/IRoleRepository';
import { Role, RoleWithPermissions, Permission, CreateRoleData, UpdateRoleData } from '../../domain/entities/Role';

export class RoleUseCases {
  constructor(private repo: IRoleRepository) {}

  getAll(): Promise<Role[]> {
    return this.repo.getAll();
  }

  getById(id: string): Promise<RoleWithPermissions> {
    return this.repo.getById(id);
  }

  create(data: CreateRoleData): Promise<Role> {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateRoleData): Promise<Role> {
    return this.repo.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  getAllPermissions(): Promise<Permission[]> {
    return this.repo.getAllPermissions();
  }
}
