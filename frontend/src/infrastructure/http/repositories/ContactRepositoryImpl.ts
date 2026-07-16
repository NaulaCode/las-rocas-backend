import { IContactMessageRepository } from '../../../domain/ports/IContactMessageRepository';
import { ContactMessage, CreateContactMessageData } from '../../../domain/entities/ContactMessage';
import { apiClient } from '../ApiClient';

export class ContactRepositoryImpl implements IContactMessageRepository {
  send(data: CreateContactMessageData): Promise<ContactMessage> {
    return apiClient.post<ContactMessage>('/contact', data);
  }
  getAll(): Promise<ContactMessage[]> {
    return apiClient.get<ContactMessage[]>('/contact');
  }
  markAsRead(id: string): Promise<void> {
    return apiClient.patch<void>(`/contact/${id}/read`, {});
  }
  countUnread(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/contact/unread-count');
  }
}
