import { INewsRepository } from '../../domain/ports/INewsRepository';
import { News, CreateNewsDTO, UpdateNewsDTO } from '../../domain/entities/News';

export class NewsUseCases {
  constructor(private repo: INewsRepository) {}

  getAllPublished(): Promise<News[]> {
    return this.repo.getAll(true);
  }

  getAllIncludingUnpublished(): Promise<News[]> {
    return this.repo.getAll(false);
  }

  getById(id: string): Promise<News> {
    return this.repo.getById(id);
  }

  getByType(type: string): Promise<News[]> {
    return this.repo.getByType(type);
  }

  create(data: CreateNewsDTO): Promise<News> {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateNewsDTO): Promise<News> {
    return this.repo.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
