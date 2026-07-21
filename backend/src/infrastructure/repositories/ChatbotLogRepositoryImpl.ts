import { ChatbotLogRepository } from '../../domain/repositories/ChatbotLogRepository';
import { ChatbotLog, ChatbotStats } from '../../domain/entities/ChatbotLog';
import { getPrisma } from '../database/postgres/PrismaService';

export class ChatbotLogRepositoryImpl implements ChatbotLogRepository {

  async create(data: Omit<ChatbotLog, 'id' | 'createdAt'>): Promise<string> {
    const prisma = getPrisma();
    const result = await prisma.chatbotLog.create({
      data: {
        query: data.query,
        answer: data.answer,
        source: data.source,
        matchedQuestion: data.matchedQuestion ?? undefined,
        confidence: data.confidence ?? undefined,
        sessionId: data.sessionId ?? undefined,
      },
      select: { id: true },
    });
    return result.id;
  }

  async updateFeedback(id: string, feedback: 'like' | 'dislike'): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotLog.update({ where: { id }, data: { feedback } });
  }

  async findById(id: string): Promise<ChatbotLog | null> {
    const prisma = getPrisma();
    const row = await prisma.chatbotLog.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      query: row.query,
      answer: row.answer,
      source: row.source as ChatbotLog['source'],
      matchedQuestion: row.matchedQuestion ?? undefined,
      confidence: row.confidence ?? undefined,
      feedback: row.feedback as ChatbotLog['feedback'] ?? undefined,
      sessionId: row.sessionId ?? undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getStats(): Promise<ChatbotStats> {
    const prisma = getPrisma();

    const [total, faq, ai, fallback] = await Promise.all([
      prisma.chatbotLog.count(),
      prisma.chatbotLog.count({ where: { source: 'faq' } }),
      prisma.chatbotLog.count({ where: { source: 'ai' } }),
      prisma.chatbotLog.count({ where: { source: 'fallback' } }),
    ]);

    const [altaCount, mediaCount, bajaCount] = await Promise.all([
      prisma.chatbotLog.count({ where: { source: 'faq', confidence: 'alta' } }),
      prisma.chatbotLog.count({ where: { source: 'faq', confidence: 'media' } }),
      prisma.chatbotLog.count({ where: { source: 'faq', confidence: 'baja' } }),
    ]);

    const daily = await prisma.$queryRaw<
      { date: string; faq: bigint; ai: bigint; fallback: bigint; total: bigint }[]
    >`
      SELECT
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE source = 'faq') as faq,
        COUNT(*) FILTER (WHERE source = 'ai') as ai,
        COUNT(*) FILTER (WHERE source = 'fallback') as fallback,
        COUNT(*) as total
      FROM chatbot_logs
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const recentLogs = await prisma.chatbotLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      total,
      faq,
      ai,
      fallback,
      byConfidence: { alta: altaCount, media: mediaCount, baja: bajaCount },
      daily: daily.map((row) => ({
        date: String(row.date),
        faq: Number(row.faq),
        ai: Number(row.ai),
        fallback: Number(row.fallback),
        total: Number(row.total),
      })),
      recentLogs: recentLogs.map((row) => ({
        id: row.id,
        query: row.query,
        answer: row.answer,
        source: row.source as ChatbotLog['source'],
        matchedQuestion: row.matchedQuestion ?? undefined,
        confidence: row.confidence ?? undefined,
        feedback: row.feedback as ChatbotLog['feedback'] ?? undefined,
        sessionId: row.sessionId ?? undefined,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }
}
