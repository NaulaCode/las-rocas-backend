import { IReviewRepository } from '../../domain/ports/IReviewRepository';
import { Review, ReviewAverage } from '../../domain/entities/Review';

export class ReviewUseCases {
  constructor(private repo: IReviewRepository) {}

  submit(data: { name: string; email: string; text: string; rating: number; serviceName?: string; role?: string }): Promise<Review> {
    return this.repo.submit(data);
  }
  getAll(params?: { approved?: string; serviceName?: string }): Promise<Review[]> {
    return this.repo.getAll(params);
  }
  getApproved(serviceName?: string): Promise<Review[]> {
    return this.repo.getApproved(serviceName);
  }
  approve(id: string): Promise<void> {
    return this.repo.approve(id);
  }
  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
  getAverage(serviceName: string): Promise<ReviewAverage> {
    return this.repo.getAverage(serviceName);
  }
}
