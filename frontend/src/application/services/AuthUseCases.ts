import { IAuthRepository } from '../../domain/ports/IAuthRepository';
import { ITokenStorage } from '../../domain/ports/ITokenStorage';
import { LoginDTO, RegisterDTO, UpdateUserDTO, AuthResponse, User, PublicUser } from '../../domain/entities/User';

export class AuthUseCases {
  constructor(
    private repo: IAuthRepository,
    private tokenStorage: ITokenStorage,
  ) {}

  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await this.repo.login(data);
    this.tokenStorage.setToken(response.token);
    return response;
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    return this.repo.register(data);
  }

  async me(): Promise<User> {
    const data = await this.repo.me();
    if ((data as any).token) {
      this.tokenStorage.setToken((data as any).token);
    }
    return data;
  }

  getUsers(): Promise<PublicUser[]> {
    return this.repo.getUsers();
  }

  updateUser(id: string, data: UpdateUserDTO): Promise<PublicUser> {
    return this.repo.updateUser(id, data);
  }

  deleteUser(id: string): Promise<void> {
    return this.repo.deleteUser(id);
  }

  logout(): void {
    this.tokenStorage.removeToken();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  forgotPassword(email: string): Promise<void> {
    return this.repo.forgotPassword(email);
  }

  resetPassword(token: string, password: string): Promise<void> {
    return this.repo.resetPassword(token, password);
  }

  myPermissions(): Promise<string[]> {
    return this.repo.myPermissions();
  }
}
