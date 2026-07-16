import { ChatbotSessionRepository } from '../../domain/repositories/ChatbotSessionRepository';
import { ChatbotSession, ChatMessage } from '../../domain/entities/ChatbotSession';
import { getPrisma } from '../database/postgres/PrismaService';

export class ChatbotSessionRepositoryImpl implements ChatbotSessionRepository {

  async findById(id: string): Promise<ChatbotSession | null> {
    const prisma = getPrisma();
    const result = await prisma.chatbotSession.findUnique({ where: { id } });
    if (!result) return null;
    return this.toDomain(result);
  }

  async save(session: ChatbotSession): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        history: session.history as any,
        summary: session.summary,
        language: session.language,
        preferredCategory: session.preferredCategory ?? undefined,
      },
      update: {
        history: session.history as any,
        summary: session.summary,
        language: session.language,
        preferredCategory: session.preferredCategory ?? undefined,
      },
    });
  }

  async updateHistory(id: string, history: ChatMessage[], summary: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotSession.update({
      where: { id },
      data: { history: history as any, summary },
    });
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotSession.delete({ where: { id } });
  }

  async cleanupOlderThan(date: Date): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotSession.deleteMany({
      where: { updatedAt: { lt: date } },
    });
  }

  private toDomain(row: any): ChatbotSession {
    return {
      id: row.id,
      history: Array.isArray(row.history) ? row.history : [],
      summary: row.summary || '',
      language: row.language || 'es',
      preferredCategory: row.preferredCategory ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
