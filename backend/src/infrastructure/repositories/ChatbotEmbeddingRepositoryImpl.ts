import { getPrisma } from '../database/postgres/PrismaService';
import { IChatbotEmbeddingRepository, SemanticSearchResult } from '../../domain/repositories/ChatbotEmbeddingRepository';

export interface ChatbotEmbeddingData {
  id: string;
  content: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatbotEmbeddingRepositoryImpl implements IChatbotEmbeddingRepository {

  async save(id: string, content: string, embedding: number[]): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotEmbedding.upsert({
      where: { id },
      create: {
        id,
        content,
        embedding: embedding as any,
      },
      update: {
        content,
        embedding: embedding as any,
      },
    });
  }

  async findByContent(content: string): Promise<ChatbotEmbeddingData | null> {
    const prisma = getPrisma();
    const result = await prisma.chatbotEmbedding.findFirst({
      where: { content },
    });
    if (!result) return null;
    return {
      id: result.id,
      content: result.content,
      embedding: Array.isArray(result.embedding) ? (result.embedding as unknown as number[]) : [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async findById(id: string): Promise<ChatbotEmbeddingData | null> {
    const prisma = getPrisma();
    const result = await prisma.chatbotEmbedding.findUnique({ where: { id } });
    if (!result) return null;
    return {
      id: result.id,
      content: result.content,
      embedding: Array.isArray(result.embedding) ? (result.embedding as unknown as number[]) : [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotEmbedding.delete({ where: { id } });
  }

  async deleteAll(): Promise<void> {
    const prisma = getPrisma();
    await prisma.chatbotEmbedding.deleteMany();
  }

  async searchSimilar(embedding: number[], topK: number = 10): Promise<SemanticSearchResult[]> {
    const prisma = getPrisma();
    const results = await prisma.$queryRaw<
      { id: string; content: string; embedding: any; created_at: Date; updated_at: Date; similarity: number }[]
    >`
      SELECT id, content, embedding, created_at, updated_at,
        1 - (embedding::jsonb <=> ${JSON.stringify(embedding)}::jsonb) as similarity
      FROM chatbot_embeddings
      ORDER BY similarity DESC
      LIMIT ${topK}
    `;
    return results.map((row) => ({
      id: row.id,
      content: row.content,
      ...this.parseId(row.id),
      similarity: Number(row.similarity.toFixed(4)),
    }));
  }

  private parseId(id: string): { type: SemanticSearchResult['type']; entityId: string } {
    const colonIdx = id.indexOf(':');
    if (colonIdx > 0) {
      const prefix = id.substring(0, colonIdx);
      const entityId = id.substring(colonIdx + 1);
      const validTypes = ['service', 'faq', 'attraction', 'news', 'organization'];
      if (validTypes.includes(prefix)) {
        return { type: prefix as SemanticSearchResult['type'], entityId };
      }
    }
    return { type: 'faq', entityId: id };
  }
}
