import { UserRepository } from '../../domain/repositories/UserRepository';
import { CreateUserData, UpdateUserData, LoginData, AuthResponse, PublicUser } from '../../domain/entities/User';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../domain/errors/AppError';
import { IMailService } from '../../domain/ports/IMailService';
import { IPasswordHasher } from '../../domain/ports/IPasswordHasher';
import { ITokenService } from '../../domain/ports/ITokenService';
import { ILogger } from '../../domain/ports/ILogger';
import { passwordResetEmail } from '../../domain/services/emailTemplates';

export class AuthUseCases {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
    private logger: ILogger,
    private frontendUrl: string,
    private mailService?: IMailService,
  ) {}

  async register(data: CreateUserData, createdBy?: string): Promise<AuthResponse> {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    if (data.password.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    const exists = await this.userRepository.existsByEmail(data.email);
    if (exists) {
      throw new ConflictError('Ya existe una cuenta con ese email');
    }

    const user = await this.userRepository.create({ ...data, createdBy });
    const token = this.tokenService.sign({ userId: user.id, role: user.role, roleId: user.roleId });

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  async updateUser(id: string, data: UpdateUserData, requesterRole: string): Promise<PublicUser> {
    const target = await this.userRepository.findById(id);
    if (!target) {
      throw new NotFoundError('Usuario no encontrado');
    }
    if (target.role === 'super_admin' && requesterRole !== 'super_admin') {
      throw new ForbiddenError('No puedes modificar un administrador general');
    }
    if (data.role && data.role !== target.role && requesterRole !== 'super_admin') {
      throw new ForbiddenError('Solo el super_admin puede cambiar roles');
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
      }
      const passwordHash = await this.passwordHasher.hash(data.password);
      await this.userRepository.updatePassword(id, passwordHash);
    }
    const { password, ...rest } = data;

    const updated = await this.userRepository.update(id, rest);
    if (!updated) throw new NotFoundError('Usuario no encontrado');
    return this.toPublicUser(updated);
  }

  async deleteUser(id: string, requesterId: string): Promise<void> {
    const target = await this.userRepository.findById(id);
    if (!target) {
      throw new ValidationError('Usuario no encontrado');
    }
    if (target.role === 'super_admin') {
      throw new ForbiddenError('No se puede eliminar un administrador general');
    }
    await this.userRepository.delete(id);
  }

  async listUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.toPublicUser);
  }

  async me(userId: string, currentRole: string): Promise<{ user: PublicUser; token?: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const result: { user: PublicUser; token?: string } = {
      user: this.toPublicUser(user),
    };

    if (user.role !== currentRole || user.roleId !== undefined) {
      result.token = this.tokenService.sign({ userId: user.id, role: user.role, roleId: user.roleId });
    }

    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    if (!data.email || !data.password) {
      throw new ValidationError('Email y contraseña son requeridos');
    }

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    const isValidPassword = await this.passwordHasher.compare(
      data.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    const token = this.tokenService.sign({ userId: user.id, role: user.role, roleId: user.roleId });

    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = this.tokenService.sign(
      { email: user.email },
      { expiresIn: '15m' }
    );

    if (this.mailService) {
      const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;
      const html = passwordResetEmail({ userName: user.firstName, resetLink });
      this.mailService.send(user.email, 'Recuperación de contraseña - Las Rocas', html).catch(e =>
        this.logger.error(`Error sending password reset email`, e)
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    let decoded: { email: string };
    try {
      decoded = this.tokenService.verify(token);
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }

    const user = await this.userRepository.findByEmail(decoded.email);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
  }

  private toPublicUser(user: any): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      isActive: user.isActive,
    };
  }
}
