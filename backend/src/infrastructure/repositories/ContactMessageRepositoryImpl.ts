import { ContactMessage, CreateContactMessageData } from '../../domain/entities/ContactMessage';
import { ContactMessageRepository } from '../../domain/repositories/ContactMessageRepository';
import { getPrisma } from '../database/postgres/PrismaService';

export class ContactMessageRepositoryImpl implements ContactMessageRepository {

  async create(data: CreateContactMessageData): Promise<ContactMessage> {
    const prisma = getPrisma();
    const result = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? undefined,
        subject: data.subject ?? undefined,
        message: data.message,
      },
    });
    return result as ContactMessage;
  }

  async findAll(): Promise<ContactMessage[]> {
    const prisma = getPrisma();
    const result = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return result as ContactMessage[];
  }

  async markAsRead(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  async countUnread(): Promise<number> {
    const prisma = getPrisma();
    return prisma.contactMessage.count({ where: { isRead: false } });
  }
}
