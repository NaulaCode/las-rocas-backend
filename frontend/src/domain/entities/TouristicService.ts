export interface TouristicService {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  duration?: string;
  image?: string;
  location?: string;
  schedule?: string;
  isActive: boolean;
  maxCapacity?: number;
  availableFrom?: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  name: string;
  description: string;
  category: string;
  image?: string;
  price?: number;
  duration?: string;
  location?: string;
  schedule?: string;
  isActive?: boolean;
  maxCapacity?: number;
  availableFrom?: string;
  availableUntil?: string;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}
