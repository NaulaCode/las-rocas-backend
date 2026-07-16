export type AttractionCategory =
  | 'natural'
  | 'cultural'
  | 'aventura'
  | 'gastronomico'
  | 'historico'
  | 'playa'
  | 'montana'
  | 'otro';

export interface TouristicAttraction {
  id: string;
  name: string;
  description: string;
  category: AttractionCategory;
  image?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  schedule?: string;
  price?: number;
  currency?: string;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttractionData {
  name: string;
  description: string;
  category: AttractionCategory;
  image?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  schedule?: string;
  price?: number;
  currency?: string;
  duration?: string;
}

export interface UpdateAttractionData {
  name?: string;
  description?: string;
  category?: AttractionCategory;
  image?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  schedule?: string;
  price?: number;
  currency?: string;
  duration?: string;
  isActive?: boolean;
}
