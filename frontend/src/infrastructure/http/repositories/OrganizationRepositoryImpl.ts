import { IOrganizationRepository } from '../../../domain/ports/IOrganizationRepository';
import { Organization, UpdateOrganizationDTO } from '../../../domain/entities/Organization';
import { apiClient } from '../ApiClient';

export class OrganizationRepositoryImpl implements IOrganizationRepository {
  get(): Promise<Organization> {
    return apiClient.get<Organization>('/organization');
  }

  update(data: UpdateOrganizationDTO): Promise<Organization> {
    return apiClient.put<Organization>('/organization', data);
  }
}
