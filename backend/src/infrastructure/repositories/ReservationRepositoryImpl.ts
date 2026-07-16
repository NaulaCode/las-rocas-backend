import { ReservationRepository, ReservationFilters } from '../../domain/repositories/ReservationRepository';
import { Reservation, CreateReservationData, UpdateReservationData } from '../../domain/entities/Reservation';
import { getPrisma } from '../database/postgres/PrismaService';

export class ReservationRepositoryImpl implements ReservationRepository {

  async findById(id: string): Promise<Reservation | null> {
    const r = await getPrisma().reservation.findUnique({ where: { id } });
    if (!r) return null;
    return this.mapToReservation(r);
  }

  async findAll(filters?: ReservationFilters): Promise<Reservation[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.serviceId) where.serviceId = filters.serviceId;
    if (filters?.startDate || filters?.endDate) {
      where.preferredDate = {};
      if (filters.startDate) where.preferredDate.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.preferredDate.lte = end;
      }
    }
    const rows = await getPrisma().reservation.findMany({ where, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.mapToReservation(r));
  }

  async findByEmail(email: string): Promise<Reservation[]> {
    const rows = await getPrisma().reservation.findMany({ where: { userEmail: email }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.mapToReservation(r));
  }

  async findByService(serviceId: string): Promise<Reservation[]> {
    const rows = await getPrisma().reservation.findMany({ where: { serviceId }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.mapToReservation(r));
  }

  async create(data: CreateReservationData): Promise<Reservation> {
    const r = await getPrisma().reservation.create({
      data: {
        serviceId: data.serviceId,
        serviceName: data.serviceName || null,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone || null,
        numberOfPeople: data.numberOfPeople || null,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        message: data.message || null,
        status: 'pendiente',
        createdBy: data.createdById ? { connect: { id: data.createdById } } : undefined,
      } as any,
    });
    return this.mapToReservation(r);
  }

  async update(id: string, data: UpdateReservationData): Promise<Reservation | null> {
    const existing = await getPrisma().reservation.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: any = {};
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.serviceName !== undefined) updateData.serviceName = data.serviceName;
    if (data.userName !== undefined) updateData.userName = data.userName;
    if (data.userEmail !== undefined) updateData.userEmail = data.userEmail;
    if (data.userPhone !== undefined) updateData.userPhone = data.userPhone;
    if (data.numberOfPeople !== undefined) updateData.numberOfPeople = data.numberOfPeople;
    if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate ? new Date(data.preferredDate) : null;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.managedById !== undefined) {
      updateData.managedBy = data.managedById ? { connect: { id: data.managedById } } : { disconnect: true };
    }

    if (Object.keys(updateData).length === 0) return this.mapToReservation(existing);

    try {
      const r = await getPrisma().reservation.update({ where: { id }, data: updateData });
      return this.mapToReservation(r);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await getPrisma().reservation.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getAvailability(serviceId: string, date: string): Promise<number> {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const count = await getPrisma().reservation.count({
      where: {
        serviceId,
        status: { in: ['pendiente', 'confirmada'] },
        preferredDate: { gte: start, lte: end },
      },
    });
    return count;
  }

  async getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const rows = await getPrisma().reservation.findMany({
      where: {
        serviceId,
        status: { in: ['pendiente', 'confirmada'] },
        preferredDate: { gte: start, lte: end },
      },
      select: { preferredDate: true },
    });

    const result: Record<string, number> = {};
    for (const row of rows) {
      if (row.preferredDate) {
        const dateStr = row.preferredDate.toISOString().split('T')[0];
        result[dateStr] = (result[dateStr] || 0) + 1;
      }
    }
    return result;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await getPrisma().reservation.findMany({
      select: { status: true },
    });
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.status] = (counts[row.status] || 0) + 1;
    }
    return counts;
  }

  async countByMonth(): Promise<{ month: string; count: number }[]> {
    const all = await getPrisma().reservation.findMany({
      where: { preferredDate: { not: null } },
      select: { preferredDate: true },
      orderBy: { preferredDate: 'asc' },
    });
    const monthCounts: Record<string, number> = {};
    for (const r of all) {
      if (r.preferredDate) {
        const d = new Date(r.preferredDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    }
    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  }

  async getTopServices(limit: number = 10): Promise<{ serviceId: string; serviceName: string; count: number }[]> {
    const rows = await getPrisma().reservation.findMany({
      where: { serviceId: { not: null } },
      select: { serviceId: true, serviceName: true },
    });
    const grouped: Record<string, { serviceId: string; serviceName: string; count: number }> = {};
    for (const r of rows) {
      const key = r.serviceId || 'unknown';
      if (!grouped[key]) {
        grouped[key] = { serviceId: key, serviceName: r.serviceName || 'Desconocido', count: 0 };
      }
      grouped[key].count++;
    }
    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private mapToReservation(row: any): Reservation {
    return {
      id: row.id,
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      userName: row.userName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      numberOfPeople: row.numberOfPeople,
      preferredDate: row.preferredDate,
      message: row.message,
      status: row.status,
      createdById: row.createdById,
      managedById: row.managedById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
