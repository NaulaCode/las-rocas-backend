export interface EmbeddableItem {
  id: string;
  text: string;
  type: 'faq' | 'service';
  metadata: Record<string, any>;
}

export interface SearchResult {
  id: string;
  text: string;
  type: 'faq' | 'service';
  score: number;
  metadata: Record<string, any>;
}

export interface IEmbeddingService {
  embed(text: string): Promise<number[]>;
  searchSimilar(query: string, items: EmbeddableItem[], topK?: number): Promise<SearchResult[]>;
  getItemEmbedding(item: EmbeddableItem): Promise<number[]>;
  invalidateCache(): void;
}
