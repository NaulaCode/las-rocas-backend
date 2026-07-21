export interface ChatbotQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDTO {
  question: string;
  answer: string;
  category: string;
  keywords?: string[];
  priority?: number;
  isActive?: boolean;
}

export interface UpdateQuestionDTO extends Partial<CreateQuestionDTO> {}

export interface ChatResponse {
  answer: string;
  matchedQuestion?: string;
  confidence?: 'alta' | 'media' | 'baja';
  aiGenerated?: boolean;
  logId?: string;
  relatedQuestions?: { question: string; answer: string }[];
}

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onDone: (result: { answer: string; aiGenerated: boolean; logId?: string; relatedQuestions?: { question: string; answer: string }[]; sources?: { type: string; name: string; similarity: number }[] }) => void;
  onError: (error: string) => void;
}

export interface ChatbotLog {
  id: string;
  query: string;
  answer: string;
  source: 'faq' | 'ai' | 'fallback';
  matchedQuestion?: string;
  confidence?: string;
  feedback?: 'like' | 'dislike';
  sessionId?: string;
  createdAt: string;
}

export interface ChatbotStats {
  total: number;
  faq: number;
  ai: number;
  fallback: number;
  byConfidence: { alta: number; media: number; baja: number };
  daily: { date: string; faq: number; ai: number; fallback: number; total: number }[];
  recentLogs: ChatbotLog[];
}
