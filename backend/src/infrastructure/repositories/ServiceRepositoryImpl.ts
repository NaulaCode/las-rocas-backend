import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { TouristicService, CreateServiceData, UpdateServiceData } from '../../domain/entities/TouristicService';
import { getPrisma } from '../database/postgres/PrismaService';
import { slugify } from '../../shared/utils/slugify';

export class ServiceRepositoryImpl implements ServiceRepository {

  async findById(id: string): Promise<TouristicService | null> {
    const result = await getPrisma().service.findUnique({ where: { id } });
    if (!result) return null;
    return this.mapToService(result);
  }

  async findBySlug(slug: string): Promise<TouristicService | null> {
    const result = await getPrisma().service.findUnique({ where: { slug } });
    if (!result) return null;
    return this.mapToService(result);
  }

  async findAll(activeOnly: boolean = false): Promise<TouristicService[]> {
    const results = await getPrisma().service.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    const services = results.map(r => this.mapToService(r));
    if (activeOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return services.filter(s => !s.availableUntil || new Date(s.availableUntil) >= today);
    }
    return services;
  }

  async findByCategory(category: string): Promise<TouristicService[]> {
    const results = await getPrisma().service.findMany({
      where: { category, isActive: true },
      orderBy: { name: 'asc' },
    });
    const services = results.map(r => this.mapToService(r));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return services.filter(s => !s.availableUntil || new Date(s.availableUntil) >= today);
  }

  async create(data: CreateServiceData): Promise<TouristicService> {
    const slug = await this.resolveUniqueSlug(slugify(data.slug || data.name));
    const result = await getPrisma().service.create({
      data: {
        slug,
        name: data.name,
        description: data.description,
        category: data.category,
        image: data.image ?? null,
        price: data.price ?? null,
        currency: data.currency ?? 'USD',
        duration: data.duration ?? null,
        location: data.location ?? null,
        schedule: data.schedule ?? null,
        isActive: true,
        maxCapacity: data.maxCapacity ?? 5,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        availableUntil: data.availableUntil ? new Date(data.availableUntil) : null,
      },
    });
    return this.mapToService(result);
  }

  async update(id: string, data: UpdateServiceData): Promise<TouristicService | null> {
    const existing = await getPrisma().service.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: Record<string, unknown> = {};
    if (data.slug !== undefined) updateData.slug = await this.resolveUniqueSlug(slugify(data.slug), id);
    else if (data.name !== undefined && data.name !== existing.name) updateData.slug = await this.resolveUniqueSlug(slugify(data.name), id);
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity;
    if (data.availableFrom !== undefined) updateData.availableFrom = data.availableFrom ?? null;
    if (data.availableUntil !== undefined) updateData.availableUntil = data.availableUntil ?? null;

    if (Object.keys(updateData).length === 0) return this.mapToService(existing);

    const result = await getPrisma().service.update({
      where: { id },
      data: updateData,
    });
    return this.mapToService(result);
  }

  async delete(id: string): Promise<boolean> {
    const result = await getPrisma().service.deleteMany({ where: { id } });
    return result.count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const result = await getPrisma().service.findUnique({
      where: { id },
      select: { id: true },
    });
    return result !== null;
  }

  private async resolveUniqueSlug(base: string, currentId?: string): Promise<string> {
    let candidate = base || 'servicio';
    let i = 2;
    while (true) {
      const existing = await getPrisma().service.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing || existing.id === currentId) return candidate;
      candidate = `${base}-${i}`;
      i++;
    }
  }

  private mapToService(row: any): TouristicService {
    return {
      id: row.id,
      slug: row.slug ?? undefined,
      name: row.name,
      description: row.description,
      category: row.category,
      image: row.image,
      price: row.price != null ? Number(row.price) : undefined,
      currency: row.currency,
      duration: row.duration,
      location: row.location,
      schedule: row.schedule,
      isActive: row.isActive,
      maxCapacity: row.maxCapacity,
      availableFrom: row.availableFrom,
      availableUntil: row.availableUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
