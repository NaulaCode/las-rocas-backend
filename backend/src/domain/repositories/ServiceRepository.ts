import { TouristicService, CreateServiceData, UpdateServiceData } from '../entities/TouristicService';

export interface ServiceRepository {
  findById(id: string): Promise<TouristicService | null>;
  findAll(activeOnly?: boolean): Promise<TouristicService[]>;
  findByCategory(category: string): Promise<TouristicService[]>;
  create(data: CreateServiceData): Promise<TouristicService>;
  update(id: string, data: UpdateServiceData): Promise<TouristicService | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}