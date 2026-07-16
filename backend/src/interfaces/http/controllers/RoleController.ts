import { Request, Response, NextFunction } from 'express';
import { RoleUseCases } from '../../../application/use-cases/RoleUseCases';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class RoleController {
  constructor(
    private roleUseCases: RoleUseCases,
    private auditLogger: IAuditLogger,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await this.roleUseCases.findAll();
      res.status(200).json({ status: 'success', data: roles });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await this.roleUseCases.findById(req.params.id as string);
      res.status(200).json({ status: 'success', data: role });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, permissionIds } = req.body;
      const role = await this.roleUseCases.create({ name, description, permissionIds });
      this.auditLogger.log({ userId: req.user!.userId, userEmail: req.user!.email || '', action: 'CREATE', entityType: 'role', entityId: role.id });
      res.status(201).json({ status: 'success', message: 'Rol creado correctamente', data: role });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, isActive, permissionIds } = req.body;
      const id = req.params.id as string;
      const role = await this.roleUseCases.update(id, { name, description, isActive, permissionIds });
      this.auditLogger.log({ userId: req.user!.userId, userEmail: req.user!.email || '', action: 'UPDATE', entityType: 'role', entityId: id, details: { changes: Object.keys(req.body) } });
      res.status(200).json({ status: 'success', message: 'Rol actualizado correctamente', data: role });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.roleUseCases.delete(id);
      this.auditLogger.log({ userId: req.user!.userId, userEmail: req.user!.email || '', action: 'DELETE', entityType: 'role', entityId: id });
      res.status(200).json({ status: 'success', message: 'Rol eliminado correctamente' });
    } catch (error) { next(error); }
  }

  async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await this.roleUseCases.getAllPermissions();
      res.status(200).json({ status: 'success', data: permissions });
    } catch (error) { next(error); }
  }
}
