export interface SemanticSearchResult {
  id: string;
  content: string;
  type: 'service' | 'faq' | 'attraction' | 'news' | 'organization';
  entityId: string;
  similarity: number;
}

export interface IChatbotEmbeddingRepository {
  searchSimilar(embedding: number[], topK?: number): Promise<SemanticSearchResult[]>;
  save(id: string, content: string, embedding: number[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}
