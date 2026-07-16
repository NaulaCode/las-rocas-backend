export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissions extends Role {
  permissions: { id: string; name: string; module: string; action: string; label: string }[];
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
