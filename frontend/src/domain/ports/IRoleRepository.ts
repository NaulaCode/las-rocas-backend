import { Role, RoleWithPermissions, Permission, CreateRoleData, UpdateRoleData } from '../entities/Role';

export interface IRoleRepository {
  getAll(): Promise<Role[]>;
  getById(id: string): Promise<RoleWithPermissions>;
  create(data: CreateRoleData): Promise<Role>;
  update(id: string, data: UpdateRoleData): Promise<Role>;
  delete(id: string): Promise<void>;
  getAllPermissions(): Promise<Permission[]>;
}
