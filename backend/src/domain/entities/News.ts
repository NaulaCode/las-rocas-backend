export type NewsType = 'noticia' | 'evento' | 'festividad' | 'actividad';

export interface News {
  id: string;
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
  title?: string;
  content?: string;
  summary?: string;
  type?: NewsType;
  image?: string;
  eventDate?: Date;
  location?: string;
  isPublished?: boolean;
}