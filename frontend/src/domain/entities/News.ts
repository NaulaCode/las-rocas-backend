export type NewsType = 'noticia' | 'evento' | 'festividad' | 'actividad';

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: NewsType;
  image?: string;
  eventDate?: string;
  location?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsDTO {
  title: string;
  content: string;
  summary?: string;
  type: NewsType;
  image?: string;
  eventDate?: string;
  location?: string;
  isPublished?: boolean;
}

export interface UpdateNewsDTO extends Partial<CreateNewsDTO> {}
