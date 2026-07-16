import { IRoleRepository } from '../../../domain/ports/IRoleRepository';
import { Role, RoleWithPermissions, Permission, CreateRoleData, UpdateRoleData } from '../../../domain/entities/Role';
import { apiClient } from '../ApiClient';

export class RoleRepositoryImpl implements IRoleRepository {
  getAll(): Promise<Role[]> {
    return apiClient.get<Role[]>('/roles');
  }

  getById(id: string): Promise<RoleWithPermissions> {
    return apiClient.get<RoleWithPermissions>(`/roles/${id}`);
  }

  create(data: CreateRoleData): Promise<Role> {
    return apiClient.post<Role>('/roles', data);
  }

  update(id: string, data: UpdateRoleData): Promise<Role> {
    return apiClient.put<Role>(`/roles/${id}`, data);
  }

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/roles/${id}`);
  }

  getAllPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>('/roles/permissions');
  }
}
