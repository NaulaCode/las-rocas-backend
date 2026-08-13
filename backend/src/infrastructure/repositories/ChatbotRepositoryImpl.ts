import { ChatbotRepository } from '../../domain/repositories/ChatbotRepository';
import { ChatbotQuestion, CreateChatbotQuestionData, UpdateChatbotQuestionData } from '../../domain/entities/ChatbotQuestion';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'que', 'se', 'en', 'a', 'al', 'del', 'y', 'o', 'u',
  'un', 'una', 'unos', 'unas', 'para', 'por', 'con', 'es', 'son', 'me', 'mi', 'tu', 'te',
  'su', 'sus', 'lo', 'le', 'si', 'no', 'pero', 'mas', 'más', 'hay', 'the', 'and', 'of',
  'to', 'in', 'on', 'for', 'is', 'do', 'are', 'you', 'your', 'i', 'we',
]);

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const HIGH_INTENT_KEYWORDS = new Set([
  'where', 'donde', 'ubicacion', 'direccion', 'address', 'location', 'maps', 'map',
]);

export class ChatbotRepositoryImpl implements ChatbotRepository {

  async findById(id: string): Promise<ChatbotQuestion | null> {
    const prisma = getPrisma();
    const result = await prisma.chatbotQuestion.findUnique({ where: { id } });
    return result as ChatbotQuestion | null;
  }

  async findAll(activeOnly: boolean = false): Promise<ChatbotQuestion[]> {
    const prisma = getPrisma();
    const result = await prisma.chatbotQuestion.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    return result as ChatbotQuestion[];
  }

  async findByCategory(category: string): Promise<ChatbotQuestion[]> {
    const prisma = getPrisma();
    const result = await prisma.chatbotQuestion.findMany({
      where: { category, isActive: true },
      orderBy: { priority: 'desc' },
    });
    return result as ChatbotQuestion[];
  }

  async search(queryText: string): Promise<ChatbotQuestion[]> {
    const prisma = getPrisma();
    const queryNorm = normalize(queryText);
    const terms = queryNorm
      .split(' ')
      .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

    const results = await prisma.chatbotQuestion.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const scored = results.map((q) => {
      const qNorm = normalize(q.question);
      const aNorm = normalize(q.answer);
      const kwNorms = (q.keywords ?? []).map((k) => normalize(k));

      let score = 0;
      if (queryNorm && qNorm === queryNorm) score += 100;
      else if (queryNorm && qNorm.includes(queryNorm)) score += 60;

      for (const term of terms) {
        const exactKeyword = kwNorms.find((k) => k === term);
        if (exactKeyword) {
          score += HIGH_INTENT_KEYWORDS.has(exactKeyword) ? 50 : 40;
          continue;
        }
        const matchedKeyword = kwNorms.find((k) => k.includes(term) || term.includes(k));
        if (matchedKeyword) {
          score += HIGH_INTENT_KEYWORDS.has(matchedKeyword) ? 35 : 20;
        } else if (qNorm.includes(term)) {
          score += 15;
        } else if (aNorm.includes(term)) {
          score += 6;
        }
      }

      score += Math.min(q.priority ?? 0, 10) * 0.5;

      return { ...q, relevance: Math.round(Math.min(score, 100)) };
    });

    return scored
      .filter((q) => (q.relevance ?? 0) >= 10)
      .sort((a, b) =>
        (b.relevance ?? 0) - (a.relevance ?? 0) ||
        (b.priority ?? 0) - (a.priority ?? 0) ||
        a.createdAt.getTime() - b.createdAt.getTime()
      ) as ChatbotQuestion[];
  }

  async create(data: CreateChatbotQuestionData): Promise<ChatbotQuestion> {
    const prisma = getPrisma();
    const result = await prisma.chatbotQuestion.create({
      data: {
        keywords: data.keywords,
        question: data.question,
        answer: data.answer,
        answerEn: data.answerEn ?? null,
        category: data.category,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return result as ChatbotQuestion;
  }

  async update(id: string, data: UpdateChatbotQuestionData): Promise<ChatbotQuestion | null> {
    const prisma = getPrisma();
    const exists = await prisma.chatbotQuestion.findUnique({ where: { id } });
    if (!exists) return null;

    const updateData: Prisma.ChatbotQuestionUpdateInput = {};
    if (data.keywords !== undefined) updateData.keywords = data.keywords;
    if (data.question !== undefined) updateData.question = data.question;
    if (data.answer !== undefined) updateData.answer = data.answer;
    if (data.answerEn !== undefined) updateData.answerEn = data.answerEn;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) return exists as ChatbotQuestion;

    const result = await prisma.chatbotQuestion.update({ where: { id }, data: updateData });
    return result as ChatbotQuestion;
  }

  async delete(id: string): Promise<boolean> {
    const prisma = getPrisma();
    try {
      await prisma.chatbotQuestion.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
