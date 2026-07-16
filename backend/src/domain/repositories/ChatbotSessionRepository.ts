import { ChatbotSession } from '../entities/ChatbotSession';

export interface ChatbotSessionRepository {
  findById(id: string): Promise<ChatbotSession | null>;
  save(session: ChatbotSession): Promise<void>;
  updateHistory(id: string, history: ChatbotSession['history'], summary: string): Promise<void>;
  delete(id: string): Promise<void>;
  cleanupOlderThan(date: Date): Promise<void>;
}
