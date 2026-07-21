import { getPrisma } from './PrismaService';
import { logger } from '../../../shared/logger/logger';

export async function ensurePgvector(): Promise<void> {
  const prisma = getPrisma();
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
    await prisma.$executeRawUnsafe(`ALTER TABLE chatbot_embeddings ADD COLUMN IF NOT EXISTS vector vector(768)`);
    const count = await prisma.$queryRawUnsafe<{ cnt: bigint }[]>(`SELECT COUNT(*) as cnt FROM chatbot_embeddings WHERE vector IS NULL`);
    if (count[0]?.cnt && Number(count[0].cnt) > 0) {
      logger.info(`Backfilling ${count[0].cnt} embeddings to vector column...`);
      await prisma.$executeRawUnsafe(`UPDATE chatbot_embeddings SET vector = embedding::text::vector WHERE vector IS NULL`);
    }
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_chatbot_embeddings_vector ON chatbot_embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100)`);
    logger.info('pgvector enabled and vector column ready');
  } catch (e) {
    logger.warn('pgvector not available, using JS fallback', e);
  }
}
