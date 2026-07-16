export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotSession {
  id: string;
  history: ChatMessage[];
  summary: string;
  language: 'es' | 'en';
  preferredCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}
