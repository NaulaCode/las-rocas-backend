import { IChatbotRepository } from '../../domain/ports/IChatbotRepository';
import { ChatbotQuestion, CreateQuestionDTO, UpdateQuestionDTO, ChatResponse, ChatbotStats, ChatStreamCallbacks } from '../../domain/entities/ChatbotQuestion';

export class ChatbotUseCases {
  constructor(private repo: IChatbotRepository) {}

  chat(query: string, sessionId?: string): Promise<ChatResponse> {
    return this.repo.chat(query, sessionId);
  }

  chatStream(query: string, sessionId: string | undefined, callbacks: ChatStreamCallbacks): Promise<void> {
    return this.repo.chatStream(query, sessionId, callbacks);
  }

  getQuestions(): Promise<ChatbotQuestion[]> {
    return this.repo.getQuestions();
  }

  getStats(): Promise<ChatbotStats> {
    return this.repo.getStats();
  }

  sendFeedback(logId: string, type: 'like' | 'dislike'): Promise<void> {
    return this.repo.sendFeedback(logId, type);
  }

  createQuestion(data: CreateQuestionDTO): Promise<ChatbotQuestion> {
    return this.repo.createQuestion(data);
  }

  updateQuestion(id: string, data: UpdateQuestionDTO): Promise<ChatbotQuestion> {
    return this.repo.updateQuestion(id, data);
  }

  deleteQuestion(id: string): Promise<void> {
    return this.repo.deleteQuestion(id);
  }
}
