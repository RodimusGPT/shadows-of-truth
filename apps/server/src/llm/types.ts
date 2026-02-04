export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmRequest {
  systemPrompt: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface LlmResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LlmProvider {
  name: string;
  generate(request: LlmRequest): Promise<LlmResponse>;
}

export type ProviderName = 'claude' | 'openai' | 'gemini';
