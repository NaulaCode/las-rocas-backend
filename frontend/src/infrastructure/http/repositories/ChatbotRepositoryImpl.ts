import { IChatbotRepository } from '../../../domain/ports/IChatbotRepository';
import { ChatbotQuestion, CreateQuestionDTO, UpdateQuestionDTO, ChatResponse, ChatbotStats, ChatStreamCallbacks } from '../../../domain/entities/ChatbotQuestion';
import { apiClient } from '../ApiClient';

const STREAM_URL = '/api/v1/chatbot/chat/stream';

export class ChatbotRepositoryImpl implements IChatbotRepository {
  chat(query: string, sessionId?: string): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/chatbot/chat', { query, sessionId });
  }

  async chatStream(query: string, sessionId: string | undefined, callbacks: ChatStreamCallbacks): Promise<void> {
    const { onToken, onDone, onError } = callbacks;

    try {
      const res = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId }),
      });

      if (!res.ok) {
        onError(`Error ${res.status}: ${res.statusText}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { onError('No se pudo leer el stream'); return; }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'token':
                onToken(data.content);
                break;
              case 'done':
                onDone(data);
                return;
              case 'error':
                onError(data.message);
                return;
            }
          } catch { }
        }
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  getQuestions(): Promise<ChatbotQuestion[]> {
    return apiClient.get<ChatbotQuestion[]>('/chatbot/questions');
  }

  getStats(): Promise<ChatbotStats> {
    return apiClient.get<ChatbotStats>('/chatbot/stats');
  }

  createQuestion(data: CreateQuestionDTO): Promise<ChatbotQuestion> {
    return apiClient.post<ChatbotQuestion>('/chatbot/questions', data);
  }

  updateQuestion(id: string, data: UpdateQuestionDTO): Promise<ChatbotQuestion> {
    return apiClient.put<ChatbotQuestion>(`/chatbot/questions/${id}`, data);
  }

  deleteQuestion(id: string): Promise<void> {
    return apiClient.delete<void>(`/chatbot/questions/${id}`);
  }

  sendFeedback(logId: string, type: 'like' | 'dislike'): Promise<void> {
    return apiClient.put<void>(`/chatbot/logs/${logId}/feedback`, { type });
  }
}
