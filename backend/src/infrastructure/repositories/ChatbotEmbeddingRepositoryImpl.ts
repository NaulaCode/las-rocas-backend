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
  private pgvectorAvailable: boolean | null = null;

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
    try {
      const vectorStr = `[${embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE chatbot_embeddings SET vector = $1::vector WHERE id = $2`,
        vectorStr, id
      );
    } catch {
      // pgvector column may not exist
    }
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
    if (this.pgvectorAvailable !== false) {
      try {
        return await this.searchWithPgvector(embedding, topK);
      } catch {
        this.pgvectorAvailable = false;
      }
    }
    return this.searchWithJs(embedding, topK);
  }

  private async searchWithPgvector(embedding: number[], topK: number): Promise<SemanticSearchResult[]> {
    const prisma = getPrisma();
    const vectorStr = `[${embedding.join(',')}]`;
    const rows = await prisma.$queryRawUnsafe<{ id: string; content: string; similarity: number }[]>(
      `SELECT id, content, 1 - (vector <=> $1::vector) as similarity
       FROM chatbot_embeddings
       WHERE vector IS NOT NULL
       ORDER BY vector <=> $1::vector
       LIMIT $2`,
      vectorStr, topK
    );
    return rows.map(r => ({
      id: r.id,
      content: r.content,
      ...this.parseId(r.id),
      similarity: Number(Number(r.similarity).toFixed(4)),
    }));
  }

  private async searchWithJs(embedding: number[], topK: number): Promise<SemanticSearchResult[]> {
    const prisma = getPrisma();
    const rows = await prisma.chatbotEmbedding.findMany({
      select: { id: true, content: true, embedding: true },
    });

    return rows
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
