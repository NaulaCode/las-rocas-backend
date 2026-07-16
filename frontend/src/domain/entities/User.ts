export type UserRole = 'super_admin' | 'admin' | 'board' | 'staff' | 'visitor';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  roleId?: string;
  isActive: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  roleId?: string;
  isActive: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  roleId?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  roleId?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}
