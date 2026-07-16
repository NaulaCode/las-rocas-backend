import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, CreateUserData, UpdateUserData } from '../../domain/entities/User';
import { getPrisma } from '../database/postgres/PrismaService';
import bcrypt from 'bcryptjs';

export class UserRepositoryImpl implements UserRepository {

  async findById(id: string): Promise<User | null> {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { email, isActive: true },
    });
    return user as User | null;
  }

  async create(data: CreateUserData): Promise<User> {
    const prisma = getPrisma();
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: data.role || 'visitor',
        createdBy: data.createdBy ? { connect: { id: data.createdBy } } : undefined,
        roleRef: data.roleId ? { connect: { id: data.roleId } } : undefined,
      },
    });
    return user as User;
  }

  async findAll(): Promise<User[]> {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users as User[];
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return null;

    const hasFields = Object.values(data).some(v => v !== undefined);
    if (!hasFields) return existing as User;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.roleId !== undefined && { roleRef: data.roleId ? { connect: { id: data.roleId } } : { disconnect: true } }),
      },
    });
    return user as User;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
