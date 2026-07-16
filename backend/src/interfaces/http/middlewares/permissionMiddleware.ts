import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors/AppError';
import { authenticate } from './authMiddleware';
import { RoleRepository } from '../../../domain/repositories/RoleRepository';
import { getPrisma } from '../../../infrastructure/database/postgres/PrismaService';

export function createPermissionLoader(roleRepo: RoleRepository) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next();
    if (req.user.role === 'super_admin') {
      req.userPermissions = [];
      return next();
    }
    let roleId = req.user.roleId;
    if (!roleId) {
      try {
        const user = await getPrisma().user.findUnique({ where: { id: req.user.userId }, select: { roleId: true } });
        roleId = user?.roleId || undefined;
        if (roleId) req.user.roleId = roleId;
      } catch {
        roleId = undefined;
      }
    }
    if (!roleId) {
      req.userPermissions = [];
      return next();
    }
    try {
      req.userPermissions = await roleRepo.getPermissionNames(roleId);
    } catch {
      req.userPermissions = [];
    }
    next();
  };
}

export function createRequirePermission(permissionName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role === 'super_admin') return next();
    if (!req.userPermissions?.includes(permissionName)) {
      return next(new ForbiddenError('No tienes permiso para esta acción'));
    }
    next();
  };
}

// Helper: combina authenticate + loadPermissions + requirePermission
export function requireAuth(loadPermissions: ReturnType<typeof createPermissionLoader>, permissionName: string) {
  return [authenticate, loadPermissions, createRequirePermission(permissionName)];
}
