import { Request, Response, NextFunction } from 'express';
import { AuthUseCases } from '../../../application/use-cases/AuthUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class AuthController {
  constructor(
    private authUseCases: AuthUseCases,
    private auditLogger: IAuditLogger,
  ) {}

  async register(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, role, roleId } = req.body;
      const result = await this.authUseCases.register({ email, password, firstName, lastName, phone, role: role || 'admin', roleId }, req.user.userId);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'CREATE', entityType: 'user', entityId: result.user.id });
      res.status(201).json({ status: 'success', message: 'Usuario registrado correctamente', data: result });
    } catch (error) { next(error); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await this.authUseCases.forgotPassword(email);
      res.status(200).json({ status: 'success', message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
    } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await this.authUseCases.resetPassword(token, password);
      res.status(200).json({ status: 'success', message: 'Contraseña actualizada correctamente' });
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authUseCases.login({ email, password });
      res.status(200).json({ status: 'success', message: 'Sesión iniciada correctamente', data: result });
    } catch (error) { next(error); }
  }

  async updateUser(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authUseCases.updateUser(req.params.id, req.body, req.user.role);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'user', entityId: req.params.id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Usuario actualizado correctamente', data: user });
    } catch (error) { next(error); }
  }

  async deleteUser(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authUseCases.deleteUser(req.params.id, req.user.userId);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'user', entityId: req.params.id });
      res.status(200).json({ status: 'success', message: 'Usuario eliminado correctamente' });
    } catch (error) { next(error); }
  }

  async listUsers(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.authUseCases.listUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) { next(error); }
  }

  async me(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.authUseCases.me(req.user.userId, req.user.role);
      res.status(200).json({ status: 'success', data });
    } catch (error) { next(error); }
  }

  async myPermissions(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ status: 'success', data: req.userPermissions || [] });
    } catch (error) { next(error); }
  }
}
