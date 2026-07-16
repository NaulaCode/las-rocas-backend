import { IReviewRepository } from '../../../domain/ports/IReviewRepository';
import { Review, CreateReviewData, ReviewAverage } from '../../../domain/entities/Review';
import { apiClient } from '../ApiClient';

export class ReviewRepositoryImpl implements IReviewRepository {
  submit(data: CreateReviewData): Promise<Review> {
    return apiClient.post<Review>('/reviews', data);
  }
  getAll(params?: { approved?: string; serviceName?: string }): Promise<Review[]> {
    const qs = new URLSearchParams();
    if (params?.approved) qs.set('approved', params.approved);
    if (params?.serviceName) qs.set('serviceName', params.serviceName);
    const q = qs.toString();
    return apiClient.get<Review[]>(`/reviews${q ? `?${q}` : ''}`);
  }
  getApproved(serviceName?: string): Promise<Review[]> {
    const qs = serviceName ? `?serviceName=${encodeURIComponent(serviceName)}` : '';
    return apiClient.get<Review[]>(`/reviews/approved${qs}`);
  }
  approve(id: string): Promise<void> {
    return apiClient.patch<void>(`/reviews/${id}/approve`, {});
  }
  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/${id}`);
  }
  getAverage(serviceName: string): Promise<ReviewAverage> {
    return apiClient.get<ReviewAverage>(`/reviews/average?serviceName=${encodeURIComponent(serviceName)}`);
  }
}
