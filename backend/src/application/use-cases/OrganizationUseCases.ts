import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Organization, UpdateOrganizationData } from '../../domain/entities/Organization';
import { NotFoundError } from '../../domain/errors/AppError';

export class OrganizationUseCases {
  constructor(private organizationRepository: OrganizationRepository) {}

  async get(): Promise<Organization> {
    const org = await this.organizationRepository.find();
    if (!org) {
      throw new NotFoundError('Información institucional no encontrada');
    }
    return org;
  }

  async update(data: UpdateOrganizationData): Promise<Organization> {
    const org = await this.organizationRepository.update(data);
    if (!org) {
      throw new NotFoundError('Información institucional no encontrada');
    }
    return org;
  }
}