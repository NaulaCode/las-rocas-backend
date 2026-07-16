export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface FunctionResponse {
  name: string;
  response: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatOptions {
  systemPrompt: string;
  messages: ChatMessage[];
  tools?: FunctionDeclaration[];
}

export interface ChatResult {
  text?: string;
  functionCalls?: FunctionCall[];
}

export interface IAiService {
  ask(prompt: string): Promise<string>;
  chat(options: ChatOptions): Promise<ChatResult>;
  chatStream(options: ChatOptions & { onToken: (token: string) => void; onFunctionCall?: (call: FunctionCall) => void }): Promise<void>;
  embed(text: string): Promise<number[]>;
}
