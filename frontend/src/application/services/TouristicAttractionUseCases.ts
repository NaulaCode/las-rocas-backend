import { ITouristicAttractionRepository } from '../../domain/ports/ITouristicAttractionRepository';
import { TouristicAttraction, CreateAttractionDTO, UpdateAttractionDTO } from '../../domain/entities/TouristicAttraction';

export class TouristicAttractionUseCases {
  constructor(private repo: ITouristicAttractionRepository) {}

  getAllActive(): Promise<TouristicAttraction[]> {
    return this.repo.getAll(true);
  }

  getAllIncludingInactive(): Promise<TouristicAttraction[]> {
    return this.repo.getAll(false);
  }

  getById(id: string): Promise<TouristicAttraction> {
    return this.repo.getById(id);
  }

  getByCategory(category: string): Promise<TouristicAttraction[]> {
    return this.repo.getByCategory(category);
  }

  create(data: CreateAttractionDTO): Promise<TouristicAttraction> {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateAttractionDTO): Promise<TouristicAttraction> {
    return this.repo.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
