export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  description?: string;
  history?: string;
  mission?: string;
  vision?: string;
  objectives?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  pageContent?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrganizationData {
  name?: string;
  legalName?: string;
  ruc?: string;
  description?: string;
  history?: string;
  mission?: string;
  vision?: string;
  objectives?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  pageContent?: Record<string, any>;
  isActive?: boolean;
}