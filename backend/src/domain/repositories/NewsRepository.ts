import { News, CreateNewsData, UpdateNewsData } from '../entities/News';

export interface NewsRepository {
  findById(id: string): Promise<News | null>;
  findAll(publishedOnly?: boolean): Promise<News[]>;
  findByType(type: string): Promise<News[]>;
  create(data: CreateNewsData): Promise<News>;
  update(id: string, data: UpdateNewsData): Promise<News | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}