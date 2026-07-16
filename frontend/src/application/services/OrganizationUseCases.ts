import { IOrganizationRepository } from '../../domain/ports/IOrganizationRepository';
import { Organization, UpdateOrganizationDTO } from '../../domain/entities/Organization';

export class OrganizationUseCases {
  constructor(private repo: IOrganizationRepository) {}

  get(): Promise<Organization> {
    return this.repo.get();
  }

  update(data: UpdateOrganizationDTO): Promise<Organization> {
    return this.repo.update(data);
  }
}
