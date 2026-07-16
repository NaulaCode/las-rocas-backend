import { ITouristicAttractionRepository } from '../../../domain/ports/ITouristicAttractionRepository';
import { TouristicAttraction, CreateAttractionDTO, UpdateAttractionDTO } from '../../../domain/entities/TouristicAttraction';
import { apiClient } from '../ApiClient';

export class TouristicAttractionRepositoryImpl implements ITouristicAttractionRepository {
  getAll(activeOnly = true): Promise<TouristicAttraction[]> {
    return apiClient.get<TouristicAttraction[]>(`/attractions?active=${activeOnly}`);
  }

  getById(id: string): Promise<TouristicAttraction> {
    return apiClient.get<TouristicAttraction>(`/attractions/${id}`);
  }

  getByCategory(category: string): Promise<TouristicAttraction[]> {
    return apiClient.get<TouristicAttraction[]>(`/attractions/category/${category}`);
  }

  create(data: CreateAttractionDTO): Promise<TouristicAttraction> {
    return apiClient.post<TouristicAttraction>('/attractions', data);
  }

  update(id: string, data: UpdateAttractionDTO): Promise<TouristicAttraction> {
    return apiClient.put<TouristicAttraction>(`/attractions/${id}`, data);
  }

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/attractions/${id}`);
  }
}
