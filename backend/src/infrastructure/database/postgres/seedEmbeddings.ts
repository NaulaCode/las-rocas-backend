import { getPrisma, disconnectPrisma } from './PrismaService';
import { log } from '../../../shared/logger/logger';
import { config } from '../../../shared/config/config';
import { GeminiService } from '../../ai/GeminiService';
import { EmbeddingService } from '../../ai/EmbeddingService';
import { ChatbotEmbeddingRepositoryImpl } from '../../repositories/ChatbotEmbeddingRepositoryImpl';
import { ServiceRepositoryImpl } from '../../repositories/ServiceRepositoryImpl';
import { ChatbotRepositoryImpl } from '../../repositories/ChatbotRepositoryImpl';
import { TouristicAttractionRepositoryImpl } from '../../repositories/TouristicAttractionRepositoryImpl';
import { NewsRepositoryImpl } from '../../repositories/NewsRepositoryImpl';
import { OrganizationRepositoryImpl } from '../../repositories/OrganizationRepositoryImpl';
import { ChatbotUseCases } from '../../../application/use-cases/ChatbotUseCases';
import { WinstonLogger } from '../../services/WinstonLogger';

async function run() {
  if (!config.ai.geminiApiKey) {
    log.warn('GEMINI_API_KEY no configurada. No se pueden generar embeddings.');
    process.exit(0);
  }

  log.info('Iniciando población de embeddings...');
  const aiService = new GeminiService(config.ai.geminiApiKey);
  const embeddingService = new EmbeddingService(aiService);
  const embeddingRepo = new ChatbotEmbeddingRepositoryImpl();
  const serviceRepo = new ServiceRepositoryImpl();
  const chatbotRepo = new ChatbotRepositoryImpl();
  const attractionRepo = new TouristicAttractionRepositoryImpl();
  const newsRepo = new NewsRepositoryImpl();
  const organizationRepo = new OrganizationRepositoryImpl();
  const logger = new WinstonLogger();

  const useCases = new ChatbotUseCases(
    chatbotRepo, serviceRepo, organizationRepo, logger, aiService,
    undefined, undefined, embeddingService, embeddingRepo,
    attractionRepo, newsRepo, undefined,
  );

  await embeddingRepo.deleteAll();
  await useCases.reindexAll();

  log.info('Embeddings poblados exitosamente.');
  await disconnectPrisma();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error poblando embeddings:', err);
  process.exit(1);
});
