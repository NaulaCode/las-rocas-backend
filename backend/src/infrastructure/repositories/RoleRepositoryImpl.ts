import { RoleRepository } from '../../domain/repositories/RoleRepository';
import { Role, RoleWithPermissions, CreateRoleData, UpdateRoleData } from '../../domain/entities/Role';
import { getPrisma } from '../database/postgres/PrismaService';

export class RoleRepositoryImpl implements RoleRepository {

  async findAll(): Promise<Role[]> {
    const prisma = getPrisma();
    return prisma.role.findMany({ orderBy: { name: 'asc' } }) as unknown as Role[];
  }

  async findById(id: string): Promise<Role | null> {
    const prisma = getPrisma();
    return prisma.role.findUnique({ where: { id } }) as unknown as Role | null;
  }

  async findByIdWithPermissions(id: string): Promise<RoleWithPermissions | null> {
    const prisma = getPrisma();
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) return null;
    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
    } as unknown as RoleWithPermissions;
  }

  async findByName(name: string): Promise<Role | null> {
    const prisma = getPrisma();
    return prisma.role.findUnique({ where: { name } }) as unknown as Role | null;
  }

  async create(data: CreateRoleData): Promise<Role> {
    const prisma = getPrisma();
    const { permissionIds, ...roleData } = data;
    const role = await prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds?.length
          ? { create: permissionIds.map(permissionId => ({ permissionId })) }
          : undefined,
      },
    });
    return role as unknown as Role;
  }

  async update(id: string, data: UpdateRoleData): Promise<Role | null> {
    const prisma = getPrisma();
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return null;

    const { permissionIds, ...roleData } = data;
    const updateData: any = { ...roleData };

    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({ roleId: id, permissionId })),
        });
      }
    }

    const role = await prisma.role.update({ where: { id }, data: updateData });
    return role as unknown as Role;
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrisma();
    try {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await prisma.role.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getPermissionNames(roleId: string): Promise<string[]> {
    const prisma = getPrisma();
    const rows = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: { select: { name: true } } },
    });
    return rows.map(rp => rp.permission.name);
  }

  async getAllPermissions(): Promise<{ id: string; name: string; module: string; action: string; label: string }[]> {
    const prisma = getPrisma();
    return prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }] });
  }
}
