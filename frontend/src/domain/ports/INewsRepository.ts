import { News, CreateNewsDTO, UpdateNewsDTO } from '../entities/News';

export interface INewsRepository {
  getAll(publishedOnly?: boolean): Promise<News[]>;
  getById(id: string): Promise<News>;
  getByType(type: string): Promise<News[]>;
  create(data: CreateNewsDTO): Promise<News>;
  update(id: string, data: UpdateNewsDTO): Promise<News>;
  delete(id: string): Promise<void>;
}
