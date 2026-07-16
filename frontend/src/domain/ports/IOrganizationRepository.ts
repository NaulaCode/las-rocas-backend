import { Organization, UpdateOrganizationDTO } from '../entities/Organization';

export interface IOrganizationRepository {
  get(): Promise<Organization>;
  update(data: UpdateOrganizationDTO): Promise<Organization>;
}
