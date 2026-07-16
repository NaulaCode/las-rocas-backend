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
