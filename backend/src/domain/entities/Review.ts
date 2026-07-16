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
  createdAt: Date;
}

export interface CreateReviewData {
  name: string;
  email: string;
  text: string;
  rating: number;
  serviceId?: string;
  serviceName?: string;
  role?: string;
}
