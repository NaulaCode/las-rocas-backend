import { ChatbotRepository } from '../../domain/repositories/ChatbotRepository';
import { ChatbotQuestion, CreateChatbotQuestionData, UpdateChatbotQuestionData } from '../../domain/entities/ChatbotQuestion';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

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
    const searchTerms = queryText.split(/\s+/).filter(Boolean);
    const queryLower = queryText.toLowerCase();

    const termConditions = searchTerms.flatMap((term) => [
      { question: { contains: term, mode: 'insensitive' as const } },
      { answer: { contains: term, mode: 'insensitive' as const } },
    ]);

    const result = await prisma.chatbotQuestion.findMany({
      where: {
        isActive: true,
        OR: [
          { question: { contains: queryText, mode: 'insensitive' } },
          { answer: { contains: queryText, mode: 'insensitive' } },
          ...termConditions,
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return result.map((q) => {
      const qLower = q.question.toLowerCase();
      const aLower = q.answer.toLowerCase();
      const kwLower = (q.keywords ?? []).map(k => k.toLowerCase());

      let score = 0;

      if (qLower === queryLower) score += 80;
      else if (qLower.includes(queryLower)) score += 60;

      for (const term of searchTerms) {
        if (qLower.includes(term)) score += 12;
        if (aLower.includes(term)) score += 6;
        if (kwLower.some(k => k.includes(term) || term.includes(k))) score += 20;
      }

      score += Math.min(q.priority ?? 0, 10);

      return { ...q, relevance: Math.min(score, 100) };
    }) as ChatbotQuestion[];
  }

  async create(data: CreateChatbotQuestionData): Promise<ChatbotQuestion> {
    const prisma = getPrisma();
    const result = await prisma.chatbotQuestion.create({
      data: {
        keywords: data.keywords,
        question: data.question,
        answer: data.answer,
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
