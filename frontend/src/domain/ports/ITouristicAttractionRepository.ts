import { TouristicAttraction, CreateAttractionDTO, UpdateAttractionDTO } from '../entities/TouristicAttraction';

export interface ITouristicAttractionRepository {
  getAll(activeOnly?: boolean): Promise<TouristicAttraction[]>;
  getById(id: string): Promise<TouristicAttraction>;
  getByCategory(category: string): Promise<TouristicAttraction[]>;
  create(data: CreateAttractionDTO): Promise<TouristicAttraction>;
  update(id: string, data: UpdateAttractionDTO): Promise<TouristicAttraction>;
  delete(id: string): Promise<void>;
}
