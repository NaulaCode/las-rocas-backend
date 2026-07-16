import { ChatbotQuestion, CreateQuestionDTO, UpdateQuestionDTO, ChatResponse, ChatbotStats, ChatStreamCallbacks } from '../entities/ChatbotQuestion';

export interface IChatbotRepository {
  chat(query: string, sessionId?: string): Promise<ChatResponse>;
  chatStream(query: string, sessionId: string | undefined, callbacks: ChatStreamCallbacks): Promise<void>;
  getQuestions(): Promise<ChatbotQuestion[]>;
  getStats(): Promise<ChatbotStats>;
  createQuestion(data: CreateQuestionDTO): Promise<ChatbotQuestion>;
  updateQuestion(id: string, data: UpdateQuestionDTO): Promise<ChatbotQuestion>;
  deleteQuestion(id: string): Promise<void>;
  sendFeedback(logId: string, type: 'like' | 'dislike'): Promise<void>;
}
