import { Review, CreateReviewData } from '../../domain/entities/Review';
import { ReviewRepository } from '../../domain/repositories/ReviewRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { ValidationError, NotFoundError } from '../../domain/errors/AppError';

export class ReviewUseCases {
  constructor(
    private reviewRepo: ReviewRepository,
    private organizationRepo: OrganizationRepository,
  ) {}

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
    await this.syncApprovedToPageContent();
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepo.delete(id);
    await this.syncApprovedToPageContent();
  }

  private async syncApprovedToPageContent(): Promise<void> {
    const org = await this.organizationRepo.find();
    if (!org) return;
    const approved = await this.reviewRepo.findAll({ approved: true });
    const reviews = approved.map((r) => ({
      id: r.id,
      name: r.name,
      text: r.text,
      rating: r.rating,
      date: r.createdAt.toISOString(),
      approved: true,
      serviceName: r.serviceName,
      role: r.role,
    }));
    const pageContent = org.pageContent as Record<string, any> | null || {};
    await this.organizationRepo.update({
      pageContent: { ...pageContent, reviews },
    });
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
