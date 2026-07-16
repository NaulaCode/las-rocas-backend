import { Review, CreateReviewData } from '../entities/Review';

export interface ReviewRepository {
  create(data: CreateReviewData): Promise<Review>;
  findAll(filter?: { approved?: boolean; serviceName?: string }): Promise<Review[]>;
  approve(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  getAverageByService(serviceName: string): Promise<number | null>;
}
