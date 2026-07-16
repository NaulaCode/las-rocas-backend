import { NewsRepository } from '../../domain/repositories/NewsRepository';
import { News, CreateNewsData, UpdateNewsData } from '../../domain/entities/News';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';

export class NewsUseCases {
  constructor(private newsRepository: NewsRepository) {}

  async getAll(publishedOnly: boolean = false): Promise<News[]> {
    return this.newsRepository.findAll(publishedOnly);
  }

  async getById(id: string): Promise<News> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new NotFoundError('Noticia/Evento no encontrado');
    }
    return news;
  }

  async getByType(type: string): Promise<News[]> {
    return this.newsRepository.findByType(type);
  }

  async create(data: CreateNewsData): Promise<News> {
    if (!data.title || !data.content || !data.type) {
      throw new ValidationError('Título, contenido y tipo son requeridos');
    }
    return this.newsRepository.create(data);
  }

  async update(id: string, data: UpdateNewsData): Promise<News> {
    const news = await this.newsRepository.update(id, data);
    if (!news) {
      throw new NotFoundError('Noticia/Evento no encontrado');
    }
    return news;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.newsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Noticia/Evento no encontrado');
    }
  }
}