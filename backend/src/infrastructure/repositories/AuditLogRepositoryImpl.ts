import { AuditLog, CreateAuditLogData } from '../../domain/entities/AuditLog';
import { AuditLogRepository, AuditLogFilters } from '../../domain/repositories/AuditLogRepository';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

export class AuditLogRepositoryImpl implements AuditLogRepository {

  async create(data: CreateAuditLogData): Promise<AuditLog> {
    const prisma = getPrisma();
    const result = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details ?? undefined,
      },
    });
    return {
      ...result,
      details: (result.details ?? {}) as Record<string, any>,
    } as AuditLog;
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const prisma = getPrisma();
    const where = this.buildWhere(filters);

    const result = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    });
    return result.map((row) => ({
      ...row,
      details: (row.details ?? {}) as Record<string, any>,
    })) as AuditLog[];
  }

  async count(filters?: AuditLogFilters): Promise<number> {
    const prisma = getPrisma();
    const where = this.buildWhere(filters);
    return prisma.auditLog.count({ where });
  }

  private buildWhere(filters?: AuditLogFilters): Prisma.AuditLogWhereInput {
    if (!filters) return {};
    const where: Prisma.AuditLogWhereInput = {};
    const conditions: Prisma.AuditLogWhereInput[] = [];

    if (filters.userId) conditions.push({ userId: filters.userId });
    if (filters.action) conditions.push({ action: filters.action as any });
    if (filters.entityType) conditions.push({ entityType: filters.entityType });
    if (filters.startDate) conditions.push({ createdAt: { gte: new Date(filters.startDate) } });
    if (filters.endDate) conditions.push({ createdAt: { lte: new Date(filters.endDate) } });

    if (conditions.length > 0) where.AND = conditions;
    return where;
  }
}
