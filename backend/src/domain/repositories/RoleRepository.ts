import { Role, RoleWithPermissions, CreateRoleData, UpdateRoleData } from '../entities/Role';

export interface RoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByIdWithPermissions(id: string): Promise<RoleWithPermissions | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: CreateRoleData): Promise<Role>;
  update(id: string, data: UpdateRoleData): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
  getPermissionNames(roleId: string): Promise<string[]>;
  getAllPermissions(): Promise<{ id: string; name: string; module: string; action: string; label: string }[]>;
}
