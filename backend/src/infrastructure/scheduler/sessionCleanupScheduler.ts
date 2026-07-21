import cron from 'node-cron';
import { ChatbotSessionRepository } from '../../domain/repositories/ChatbotSessionRepository';
import { logger } from '../../shared/logger/logger';

export class SessionCleanupScheduler {
  constructor(private sessionRepository: ChatbotSessionRepository) {}

  start(): void {
    cron.schedule('0 3 * * *', async () => {
      logger.info('Running chatbot session cleanup...');
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        await this.sessionRepository.cleanupOlderThan(thirtyDaysAgo);
        logger.info('Session cleanup completed');
      } catch (error) {
        logger.error(`Session cleanup error: ${(error as Error).message}`);
      }
    });

    logger.info('Session cleanup scheduler started (daily at 03:00)');
  }
}
