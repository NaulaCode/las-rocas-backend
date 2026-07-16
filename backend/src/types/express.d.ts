import { UserRole } from '../domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role: UserRole;
        roleId?: string;
      };
      userPermissions?: string[];
    }
  }
}
