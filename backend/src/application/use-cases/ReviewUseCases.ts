import { Review, CreateReviewData } from '../../domain/entities/Review';
import { ReviewRepository } from '../../domain/repositories/ReviewRepository';
import { ValidationError, NotFoundError } from '../../domain/errors/AppError';

export class ReviewUseCases {
  constructor(private reviewRepo: ReviewRepository) {}

  async submit(data: CreateReviewData): Promise<Review> {
    if (!data.name || !data.email || !data.text) {
      throw new ValidationError('Nombre, email y reseña son requeridos');
    }
    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError('La calificación debe ser entre 1 y 5');
    }
    return this.reviewRepo.create(data);
  }

  async getAll(filter?: { approved?: boolean; serviceName?: string }): Promise<Review[]> {
    return this.reviewRepo.findAll(filter);
  }

  async getApproved(serviceName?: string): Promise<Review[]> {
    return this.reviewRepo.findAll({ approved: true, serviceName });
  }

  async approve(id: string): Promise<void> {
    await this.reviewRepo.approve(id);
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepo.delete(id);
  }

  async getAverageByService(serviceName: string): Promise<{ average: number | null; count: number }> {
    const reviews = await this.reviewRepo.findAll({ approved: true, serviceName });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: reviews.length > 0 ? Math.round((total / reviews.length) * 10) / 10 : null,
      count: reviews.length,
    };
  }
}
