import { ContactMessage, CreateContactMessageData } from '../../domain/entities/ContactMessage';
import { ContactMessageRepository } from '../../domain/repositories/ContactMessageRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { IMailService } from '../../domain/ports/IMailService';
import { ILogger } from '../../domain/ports/ILogger';
import { ValidationError } from '../../domain/errors/AppError';
import { adminNewContactMessage } from '../../domain/services/emailTemplates';

export class ContactUseCases {
  constructor(
    private contactRepo: ContactMessageRepository,
    private logger: ILogger,
    private organizationRepo?: OrganizationRepository,
    private mailService?: IMailService,
  ) {}

  async send(data: CreateContactMessageData): Promise<ContactMessage> {
    if (!data.name || !data.email || !data.message) {
      throw new ValidationError('Nombre, email y mensaje son requeridos');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Email inválido');
    }
    const message = await this.contactRepo.create(data);

    if (this.mailService && this.organizationRepo) {
      const org = await this.organizationRepo.find();
      if (org?.email) {
        const html = adminNewContactMessage({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        });
        this.mailService.send(org.email, 'Nuevo mensaje de contacto - Las Rocas', html).catch(e =>
          this.logger.error('Error sending contact notification', e)
        );
      }
    }

    return message;
  }

  async getAll(): Promise<ContactMessage[]> {
    return this.contactRepo.findAll();
  }

  async markAsRead(id: string): Promise<void> {
    await this.contactRepo.markAsRead(id);
  }

  async countUnread(): Promise<number> {
    return this.contactRepo.countUnread();
  }
}
