import { Review, CreateReviewData, ReviewAverage } from '../entities/Review';

export interface IReviewRepository {
  submit(data: CreateReviewData): Promise<Review>;
  getAll(params?: { approved?: string; serviceName?: string }): Promise<Review[]>;
  getApproved(serviceName?: string): Promise<Review[]>;
  approve(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  getAverage(serviceName: string): Promise<ReviewAverage>;
}
