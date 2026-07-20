import { NewsRepository } from '../../domain/repositories/NewsRepository';
import { News, CreateNewsData, UpdateNewsData } from '../../domain/entities/News';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

export class NewsRepositoryImpl implements NewsRepository {

  async findById(id: string): Promise<News | null> {
    const prisma = getPrisma();
    const result = await prisma.news.findUnique({ where: { id } });
    return result as News | null;
  }

  async findAll(publishedOnly: boolean = false): Promise<News[]> {
    const prisma = getPrisma();
    const result = await prisma.news.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: [
        { eventDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return result as News[];
  }

  async findByType(type: string): Promise<News[]> {
    const prisma = getPrisma();
    const result = await prisma.news.findMany({
      where: { type: type as any, isPublished: true },
      orderBy: { eventDate: 'desc' },
    });
    return result as News[];
  }

  async create(data: CreateNewsData): Promise<News> {
    const prisma = getPrisma();
    const result = await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary ?? undefined,
        type: data.type,
        image: data.image ?? undefined,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        location: data.location ?? undefined,
        isPublished: data.isPublished ?? true,
      },
    });
    return result as News;
  }

  async update(id: string, data: UpdateNewsData): Promise<News | null> {
    const prisma = getPrisma();
    const exists = await prisma.news.findUnique({ where: { id } });
    if (!exists) return null;

    const updateData: Prisma.NewsUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate ? new Date(data.eventDate) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    if (Object.keys(updateData).length === 0) return exists as News;

    const result = await prisma.news.update({ where: { id }, data: updateData });
    return result as News;
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrisma();
    try {
      await prisma.news.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async existsById(id: string): Promise<boolean> {
    const prisma = getPrisma();
    const result = await prisma.news.findUnique({ where: { id }, select: { id: true } });
    return result !== null;
  }
}
