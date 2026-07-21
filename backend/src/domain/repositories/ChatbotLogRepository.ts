import { ChatbotLog, ChatbotStats } from '../entities/ChatbotLog';

export interface ChatbotLogRepository {
  create(data: Omit<ChatbotLog, 'id' | 'createdAt'>): Promise<string>;
  updateFeedback(id: string, feedback: 'like' | 'dislike'): Promise<void>;
  findById(id: string): Promise<ChatbotLog | null>;
  getStats(): Promise<ChatbotStats>;
}
