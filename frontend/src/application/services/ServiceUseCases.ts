import { IServiceRepository } from '../../domain/ports/IServiceRepository';
import { TouristicService, CreateServiceDTO, UpdateServiceDTO } from '../../domain/entities/TouristicService';

export class ServiceUseCases {
  constructor(private repo: IServiceRepository) {}

  getAllActive(): Promise<TouristicService[]> {
    return this.repo.getAll(true);
  }

  getAllIncludingInactive(): Promise<TouristicService[]> {
    return this.repo.getAll(false);
  }

  getById(id: string): Promise<TouristicService> {
    return this.repo.getById(id);
  }

  getByCategory(category: string): Promise<TouristicService[]> {
    return this.repo.getByCategory(category);
  }

  create(data: CreateServiceDTO): Promise<TouristicService> {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateServiceDTO): Promise<TouristicService> {
    return this.repo.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
