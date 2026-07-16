export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  label: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}
