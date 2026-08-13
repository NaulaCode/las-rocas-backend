export interface ChatbotQuestion {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  answerEn?: string | null;
  category: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  relevance?: number;
}

export interface CreateChatbotQuestionData {
  keywords: string[];
  question: string;
  answer: string;
  answerEn?: string | null;
  category: string;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateChatbotQuestionData {
  keywords?: string[];
  question?: string;
  answer?: string;
  answerEn?: string | null;
  category?: string;
  priority?: number;
  isActive?: boolean;
}