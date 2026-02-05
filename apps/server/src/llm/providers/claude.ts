import { LlmProvider, LlmRequest, LlmResponse } from '../types';

export function createClaudeProvider(apiKey: string): LlmProvider {
  return {
    name: 'claude',
    async generate(request: LlmRequest): Promise<LlmResponse> {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.8,
          system: request.systemPrompt,
          messages: request.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error (${response.status}): ${error}`);
      }

      const data = (await response.json()) as {
        content?: { text?: string }[];
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      const content = data?.content?.[0]?.text;
      if (!content) {
        throw new Error('Claude API returned unexpected response structure');
      }
      return {
        content,
        usage: {
          inputTokens: data.usage?.input_tokens ?? 0,
          outputTokens: data.usage?.output_tokens ?? 0,
        },
      };
    },
  };
}
