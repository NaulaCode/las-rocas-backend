import { IServiceRepository } from '../../../domain/ports/IServiceRepository';
import { TouristicService, CreateServiceDTO, UpdateServiceDTO } from '../../../domain/entities/TouristicService';
import { apiClient } from '../ApiClient';

export class ServiceRepositoryImpl implements IServiceRepository {
  getAll(activeOnly = true): Promise<TouristicService[]> {
    return apiClient.get<TouristicService[]>(`/services?active=${activeOnly}`);
  }

  getById(id: string): Promise<TouristicService> {
    return apiClient.get<TouristicService>(`/services/${id}`);
  }

  getByCategory(category: string): Promise<TouristicService[]> {
    return apiClient.get<TouristicService[]>(`/services/category/${category}`);
  }

  create(data: CreateServiceDTO): Promise<TouristicService> {
    return apiClient.post<TouristicService>('/services', data);
  }

  update(id: string, data: UpdateServiceDTO): Promise<TouristicService> {
    return apiClient.put<TouristicService>(`/services/${id}`, data);
  }

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/services/${id}`);
  }
}
