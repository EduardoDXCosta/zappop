export type AIProviderName = 'claude' | 'gpt' | 'gemini';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AIToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface AIChatRequest {
  system: string;
  messages: AIMessage[];
  tools?: AIToolDefinition[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  apiKey?: string;
}

export interface AIChatResponse {
  text: string;
  toolCalls: AIToolCall[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  rawModel: string;
}

export interface AIProvider {
  name: AIProviderName;
  chat(req: AIChatRequest): Promise<AIChatResponse>;
}
