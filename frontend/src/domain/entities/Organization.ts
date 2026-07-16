export interface Organization {
  id: string;
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  history?: string;
  phone?: string;
  email?: string;
  address?: string;
  coverImage?: string;
  logo?: string;
  pageContent: PageContent;
}

export interface PageContent {
  home?: Record<string, any>;
  conocenos?: Record<string, any>;
  contacto?: Record<string, any>;
  gallery?: Array<{ url: string; caption?: string; type?: string }>;
  categories?: Array<{ name: string; label?: string; icon?: string; gradient?: string }>;
  reviews?: Array<{
    id: string;
    name: string;
    text: string;
    rating: number;
    date: string;
    approved: boolean;
    serviceName?: string;
    role?: string;
  }>;
  notifications?: Array<{
    id: string;
    message: string;
    date: string;
    active: boolean;
  }>;
  blockedDates?: Array<{
    id: string;
    date: string;
    reason: string;
    createdAt: string;
  }>;
  adminUsers?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
  [key: string]: any;
}

export interface UpdateOrganizationDTO {
  name?: string;
  description?: string;
  mission?: string;
  vision?: string;
  history?: string;
  phone?: string;
  email?: string;
  address?: string;
  coverImage?: string;
  logo?: string;
  pageContent?: PageContent;
}
