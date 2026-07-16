export type ServiceCategory = string;

export interface TouristicService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  image?: string;
  price?: number;
  currency?: string;
  duration?: string;
  location?: string;
  schedule?: string;
  isActive: boolean;
  maxCapacity?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: ServiceCategory;
  image?: string;
  price?: number;
  currency?: string;
  duration?: string;
  location?: string;
  schedule?: string;
  maxCapacity?: number;
  availableFrom?: string;
  availableUntil?: string;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  category?: ServiceCategory;
  image?: string;
  price?: number;
  currency?: string;
  duration?: string;
  location?: string;
  schedule?: string;
  isActive?: boolean;
  maxCapacity?: number;
  availableFrom?: string;
  availableUntil?: string;
}