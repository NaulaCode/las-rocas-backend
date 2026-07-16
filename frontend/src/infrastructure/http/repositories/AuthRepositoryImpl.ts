import { IAuthRepository, MeResponse } from '../../../domain/ports/IAuthRepository';
import { LoginDTO, RegisterDTO, UpdateUserDTO, AuthResponse, User, PublicUser } from '../../../domain/entities/User';
import { apiClient } from '../ApiClient';

export class AuthRepositoryImpl implements IAuthRepository {
  login(data: LoginDTO): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  }

  register(data: RegisterDTO): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  }

  me(): Promise<MeResponse> {
    return apiClient.get<any>('/auth/me').then(data => {
      // Backend returns { user: { id, email, role, ... }, token? }
      // We flatten so MeResponse (extends User) works correctly
      if (data && data.user) {
        return { ...data.user, token: data.token };
      }
      return data;
    });
  }

  getUsers(): Promise<PublicUser[]> {
    return apiClient.get<PublicUser[]>('/auth/users');
  }

  updateUser(id: string, data: UpdateUserDTO): Promise<PublicUser> {
    return apiClient.put<PublicUser>(`/auth/users/${id}`, data);
  }

  deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/auth/users/${id}`);
  }

  forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post<void>('/auth/reset-password', { token, password });
  }

  myPermissions(): Promise<string[]> {
    return apiClient.get<string[]>('/auth/me/permissions');
  }
}
