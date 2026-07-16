import { ChatbotQuestion, CreateChatbotQuestionData, UpdateChatbotQuestionData } from '../entities/ChatbotQuestion';

export interface ChatbotRepository {
  findById(id: string): Promise<ChatbotQuestion | null>;
  findAll(activeOnly?: boolean): Promise<ChatbotQuestion[]>;
  findByCategory(category: string): Promise<ChatbotQuestion[]>;
  search(query: string): Promise<ChatbotQuestion[]>;
  create(data: CreateChatbotQuestionData): Promise<ChatbotQuestion>;
  update(id: string, data: UpdateChatbotQuestionData): Promise<ChatbotQuestion | null>;
  delete(id: string): Promise<boolean>;
}