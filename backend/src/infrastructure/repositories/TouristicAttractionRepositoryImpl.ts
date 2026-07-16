import { TouristicAttractionRepository } from '../../domain/repositories/TouristicAttractionRepository';
import { TouristicAttraction, CreateAttractionData, UpdateAttractionData } from '../../domain/entities/TouristicAttraction';
import { getPrisma } from '../database/postgres/PrismaService';

export class TouristicAttractionRepositoryImpl implements TouristicAttractionRepository {

  async findById(id: string): Promise<TouristicAttraction | null> {
    const r = await getPrisma().touristicAttraction.findUnique({ where: { id } });
    if (!r) return null;
    return this.mapToAttraction(r);
  }

  async findAll(activeOnly: boolean = false): Promise<TouristicAttraction[]> {
    const rows = await getPrisma().touristicAttraction.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.mapToAttraction(r));
  }

  async findByCategory(category: string): Promise<TouristicAttraction[]> {
    const rows = await getPrisma().touristicAttraction.findMany({
      where: { category: category as any, isActive: true },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => this.mapToAttraction(r));
  }

  async create(data: CreateAttractionData): Promise<TouristicAttraction> {
    const r = await getPrisma().touristicAttraction.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category as any,
        image: data.image ?? null,
        location: data.location ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        schedule: data.schedule ?? null,
        price: data.price ?? null,
        currency: data.currency ?? 'USD',
        duration: data.duration ?? null,
      },
    });
    return this.mapToAttraction(r);
  }

  async update(id: string, data: UpdateAttractionData): Promise<TouristicAttraction | null> {
    const existing = await getPrisma().touristicAttraction.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) return this.mapToAttraction(existing);

    const r = await getPrisma().touristicAttraction.update({ where: { id }, data: updateData });
    return this.mapToAttraction(r);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await getPrisma().touristicAttraction.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async existsById(id: string): Promise<boolean> {
    const r = await getPrisma().touristicAttraction.findUnique({ where: { id }, select: { id: true } });
    return r !== null;
  }

  private mapToAttraction(row: any): TouristicAttraction {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      image: row.image,
      location: row.location,
      latitude: row.latitude != null ? Number(row.latitude) : undefined,
      longitude: row.longitude != null ? Number(row.longitude) : undefined,
      schedule: row.schedule,
      price: row.price != null ? Number(row.price) : undefined,
      currency: row.currency,
      duration: row.duration,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
