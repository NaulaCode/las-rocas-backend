import { IAiService } from '../../domain/ports/IAiService';
import { IEmbeddingService, EmbeddableItem, SearchResult } from '../../domain/ports/IEmbeddingService';
import { getPrisma } from '../database/postgres/PrismaService';

export class EmbeddingService implements IEmbeddingService {
  private cache = new Map<string, number[]>();

  constructor(private aiService: IAiService) {}

  async embed(text: string): Promise<number[]> {
    const cached = this.cache.get(text);
    if (cached) return cached;
    const embedding = await this.aiService.embed(text);
    this.cache.set(text, embedding);
    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    return embedding;
  }

  async searchSimilar(query: string, items: EmbeddableItem[], topK: number = 5): Promise<SearchResult[]> {
    const queryVec = await this.embed(query);
    const scored: { item: EmbeddableItem; score: number }[] = [];

    for (const item of items) {
      const itemVec = await this.getItemEmbedding(item);
      const score = this.cosineSimilarity(queryVec, itemVec);
      scored.push({ item, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => ({
      id: s.item.id,
      text: s.item.text,
      type: s.item.type,
      score: s.score,
      metadata: s.item.metadata,
    }));
  }

  async getItemEmbedding(item: EmbeddableItem): Promise<number[]> {
    const cached = await this.getStoredEmbedding(item.id);
    if (cached) return cached;
    const embedding = await this.embed(item.text);
    await this.storeEmbedding(item.id, item.text, embedding);
    return embedding;
  }

  private async getStoredEmbedding(id: string): Promise<number[] | null> {
    try {
      const prisma = getPrisma();
      const row = await prisma.chatbotEmbedding.findUnique({ where: { id } });
      if (row && row.embedding) {
        const emb = row.embedding as any;
        return Array.isArray(emb) ? emb.map(Number) : null;
      }
    } catch { }
    return null;
  }

  private async storeEmbedding(id: string, text: string, vec: number[]): Promise<void> {
    try {
      const prisma = getPrisma();
      await prisma.chatbotEmbedding.upsert({
        where: { id },
        create: { id, content: text, embedding: vec },
        update: { embedding: vec, content: text },
      });
    } catch { }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  invalidateCache(): void {
    this.cache.clear();
  }
}
