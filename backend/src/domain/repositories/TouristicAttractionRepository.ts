import { TouristicAttraction, CreateAttractionData, UpdateAttractionData } from '../entities/TouristicAttraction';

export interface TouristicAttractionRepository {
  findById(id: string): Promise<TouristicAttraction | null>;
  findAll(activeOnly?: boolean): Promise<TouristicAttraction[]>;
  findByCategory(category: string): Promise<TouristicAttraction[]>;
  create(data: CreateAttractionData): Promise<TouristicAttraction>;
  update(id: string, data: UpdateAttractionData): Promise<TouristicAttraction | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
