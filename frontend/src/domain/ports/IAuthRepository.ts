import { LoginDTO, RegisterDTO, UpdateUserDTO, AuthResponse, User, PublicUser } from '../entities/User';

export interface MeResponse extends User {
  token?: string;
}

export interface IAuthRepository {
  login(data: LoginDTO): Promise<AuthResponse>;
  register(data: RegisterDTO): Promise<AuthResponse>;
  me(): Promise<MeResponse>;
  getUsers(): Promise<PublicUser[]>;
  updateUser(id: string, data: UpdateUserDTO): Promise<PublicUser>;
  deleteUser(id: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  myPermissions(): Promise<string[]>;
}
