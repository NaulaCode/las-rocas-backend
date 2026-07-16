export interface Review {
  id: string;
  name: string;
  email: string;
  text: string;
  rating: number;
  serviceId?: string;
  serviceName?: string;
  role?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewData {
  name: string;
  email: string;
  text: string;
  rating: number;
  serviceId?: string;
  serviceName?: string;
  role?: string;
  turnstileToken?: string;
}

export interface ReviewAverage {
  average: number | null;
  count: number;
}
