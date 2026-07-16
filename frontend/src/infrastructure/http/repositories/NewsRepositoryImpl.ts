import { INewsRepository } from '../../../domain/ports/INewsRepository';
import { News, CreateNewsDTO, UpdateNewsDTO } from '../../../domain/entities/News';
import { apiClient } from '../ApiClient';

export class NewsRepositoryImpl implements INewsRepository {
  getAll(publishedOnly = true): Promise<News[]> {
    return apiClient.get<News[]>(`/news?published=${publishedOnly}`);
  }

  getById(id: string): Promise<News> {
    return apiClient.get<News>(`/news/${id}`);
  }

  getByType(type: string): Promise<News[]> {
    return apiClient.get<News[]>(`/news/type/${type}`);
  }

  create(data: CreateNewsDTO): Promise<News> {
    return apiClient.post<News>('/news', data);
  }

  update(id: string, data: UpdateNewsDTO): Promise<News> {
    return apiClient.put<News>(`/news/${id}`, data);
  }

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/news/${id}`);
  }
}
