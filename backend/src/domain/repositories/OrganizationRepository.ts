import { Organization, UpdateOrganizationData } from '../entities/Organization';

export interface OrganizationRepository {
  find(): Promise<Organization | null>;
  update(data: UpdateOrganizationData): Promise<Organization | null>;
}