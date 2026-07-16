import { IContactMessageRepository } from '../../domain/ports/IContactMessageRepository';
import { ContactMessage } from '../../domain/entities/ContactMessage';

export class ContactUseCases {
  constructor(private contactRepo: IContactMessageRepository) {}

  async send(data: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<ContactMessage> {
    return this.contactRepo.send(data);
  }

  async getAll(): Promise<ContactMessage[]> {
    return this.contactRepo.getAll();
  }

  async markAsRead(id: string): Promise<void> {
    return this.contactRepo.markAsRead(id);
  }

  async countUnread(): Promise<{ count: number }> {
    return this.contactRepo.countUnread();
  }
}
