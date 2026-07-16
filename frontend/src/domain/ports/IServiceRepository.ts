import { TouristicService, CreateServiceDTO, UpdateServiceDTO } from '../entities/TouristicService';

export interface IServiceRepository {
  getAll(activeOnly?: boolean): Promise<TouristicService[]>;
  getById(id: string): Promise<TouristicService>;
  getByCategory(category: string): Promise<TouristicService[]>;
  create(data: CreateServiceDTO): Promise<TouristicService>;
  update(id: string, data: UpdateServiceDTO): Promise<TouristicService>;
  delete(id: string): Promise<void>;
}
