import { ContactMessage, CreateContactMessageData } from '../entities/ContactMessage';

export interface IContactMessageRepository {
  send(data: CreateContactMessageData): Promise<ContactMessage>;
  getAll(): Promise<ContactMessage[]>;
  markAsRead(id: string): Promise<void>;
  countUnread(): Promise<{ count: number }>;
}
