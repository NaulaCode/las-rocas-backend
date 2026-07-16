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
    const rows = await prisma.chatbotEmbedding.findMany({
      select: { id: true, content: true, embedding: true },
    });

    const results = rows
      .map((row) => {
        const stored = Array.isArray(row.embedding) ? (row.embedding as unknown as number[]) : [];
        const similarity = this.cosineSimilarity(embedding, stored);
        return {
          id: row.id,
          content: row.content,
          ...this.parseId(row.id),
          similarity: Number(similarity.toFixed(4)),
        };
      })
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
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
