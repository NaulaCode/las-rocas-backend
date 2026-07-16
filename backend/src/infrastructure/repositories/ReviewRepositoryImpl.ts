import { Review, CreateReviewData } from '../../domain/entities/Review';
import { ReviewRepository } from '../../domain/repositories/ReviewRepository';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

export class ReviewRepositoryImpl implements ReviewRepository {

  async create(data: CreateReviewData): Promise<Review> {
    const prisma = getPrisma();
    const result = await prisma.review.create({
      data: {
        name: data.name,
        email: data.email,
        text: data.text,
        rating: data.rating,
        serviceId: data.serviceId ?? undefined,
        serviceName: data.serviceName ?? undefined,
        role: data.role ?? undefined,
      },
    });
    return result as Review;
  }

  async findAll(filter?: { approved?: boolean; serviceName?: string }): Promise<Review[]> {
    const prisma = getPrisma();
    const where: Prisma.ReviewWhereInput = {};
    if (filter?.approved !== undefined) where.isApproved = filter.approved;
    if (filter?.serviceName) where.serviceName = filter.serviceName;

    const result = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return result as Review[];
  }

  async approve(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.review.update({ where: { id }, data: { isApproved: true } });
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.review.delete({ where: { id } });
  }

  async getAverageByService(serviceName: string): Promise<number | null> {
    const prisma = getPrisma();
    const result = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { serviceName, isApproved: true },
    });
    const avg = result._avg.rating;
    return avg !== null ? parseFloat(avg.toFixed(1)) : null;
  }
}
