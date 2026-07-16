import { ContactMessage, CreateContactMessageData } from '../entities/ContactMessage';

export interface ContactMessageRepository {
  create(data: CreateContactMessageData): Promise<ContactMessage>;
  findAll(): Promise<ContactMessage[]>;
  markAsRead(id: string): Promise<void>;
  countUnread(): Promise<number>;
}
