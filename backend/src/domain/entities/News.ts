export type NewsType = 'noticia' | 'evento' | 'festividad' | 'actividad';

export interface News {
  id: string;
  slug?: string;
  title: string;
  content: string;
  summary?: string;
  type: NewsType;
  image?: string;
  eventDate?: Date;
  location?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewsData {
  slug?: string;
  title: string;
  content: string;
  summary?: string;
  type: NewsType;
  image?: string;
  eventDate?: Date;
  location?: string;
  isPublished?: boolean;
}

export interface UpdateNewsData {
  slug?: string;
  title?: string;
  content?: string;
  summary?: string;
  type?: NewsType;
  image?: string;
  eventDate?: Date;
  location?: string;
  isPublished?: boolean;
}