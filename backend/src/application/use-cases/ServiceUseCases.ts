import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { TouristicService, CreateServiceData, UpdateServiceData } from '../../domain/entities/TouristicService';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';

export class ServiceUseCases {
  constructor(private serviceRepository: ServiceRepository) {}

  async getAll(activeOnly: boolean = false): Promise<TouristicService[]> {
    return this.serviceRepository.findAll(activeOnly);
  }

  async getById(id: string): Promise<TouristicService> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Servicio');
    }
    return service;
  }

  async getByCategory(category: string): Promise<TouristicService[]> {
    return this.serviceRepository.findByCategory(category);
  }

  async create(data: CreateServiceData): Promise<TouristicService> {
    if (!data.name || !data.description || !data.category) {
      throw new ValidationError('Nombre, descripción y categoría son requeridos');
    }
    return this.serviceRepository.create(data);
  }

  async update(id: string, data: UpdateServiceData): Promise<TouristicService> {
    const service = await this.serviceRepository.update(id, data);
    if (!service) {
      throw new NotFoundError('Servicio');
    }
    return service;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.serviceRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Servicio');
    }
  }
}