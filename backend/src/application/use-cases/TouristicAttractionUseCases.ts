import { TouristicAttractionRepository } from '../../domain/repositories/TouristicAttractionRepository';
import { TouristicAttraction, CreateAttractionData, UpdateAttractionData } from '../../domain/entities/TouristicAttraction';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';
import { isUUID } from '../../shared/utils/isUUID';

export class TouristicAttractionUseCases {
  constructor(private repository: TouristicAttractionRepository) {}

  async getAll(activeOnly: boolean = false): Promise<TouristicAttraction[]> {
    return this.repository.findAll(activeOnly);
  }

  async getById(idOrSlug: string): Promise<TouristicAttraction> {
    let item: TouristicAttraction | null = null;
    if (isUUID(idOrSlug)) {
      item = await this.repository.findById(idOrSlug);
    }
    if (!item) {
      item = await this.repository.findBySlug(idOrSlug);
    }
    if (!item) throw new NotFoundError('Atractivo turístico no encontrado');
    return item;
  }

  async getByCategory(category: string): Promise<TouristicAttraction[]> {
    return this.repository.findByCategory(category);
  }

  async create(data: CreateAttractionData): Promise<TouristicAttraction> {
    if (!data.name || !data.description || !data.category) {
      throw new ValidationError('Nombre, descripción y categoría son requeridos');
    }
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateAttractionData): Promise<TouristicAttraction> {
    const updated = await this.repository.update(id, data);
    if (!updated) throw new NotFoundError('Atractivo turístico no encontrado');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError('Atractivo turístico no encontrado');
  }
}
