import { LlmProvider, LlmRequest, LlmResponse } from '../types';

export function createOpenAiProvider(apiKey: string): LlmProvider {
  return {
    name: 'openai',
    async generate(request: LlmRequest): Promise<LlmResponse> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.8,
          messages: [
            { role: 'system', content: request.systemPrompt },
            ...request.messages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${error}`);
      }

      const data: any = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
      };
    },
  };
}
