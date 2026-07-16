// Entidad User - representa un usuario en el sistema
// Esta es la lógica de negocio pura, sin dependencias externas

export type UserRole = 'super_admin' | 'admin' | 'board' | 'staff' | 'visitor';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: string;
  roleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Usuario sin datos sensibles (para enviar al frontend)
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

// Datos para crear un nuevo usuario
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  createdBy?: string;
  roleId?: string;
}

// Datos para actualizar un usuario
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
  roleId?: string;
}

// Datos para hacer login
export interface LoginData {
  email: string;
  password: string;
}

// Respuesta del login
export interface AuthResponse {
  user: PublicUser;
  token: string;
}