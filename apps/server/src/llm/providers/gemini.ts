import { LlmProvider, LlmRequest, LlmResponse } from '../types';

export function createGeminiProvider(apiKey: string, model?: string): LlmProvider {
  const geminiModel = model ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  // Gemma models don't support systemInstruction — fold it into the first user message
  const supportsSystemInstruction = !geminiModel.startsWith('gemma');

  return {
    name: 'gemini',
    async generate(request: LlmRequest): Promise<LlmResponse> {
      const contents = request.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // For models without system instruction support, prepend to first user message
      if (!supportsSystemInstruction && contents.length > 0 && contents[0].role === 'user') {
        contents[0] = {
          ...contents[0],
          parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${request.systemPrompt}\n[END SYSTEM INSTRUCTIONS]\n\n${contents[0].parts[0].text}` }],
        };
      }

      const body: any = {
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.8,
        },
      };

      if (supportsSystemInstruction) {
        body.systemInstruction = { parts: [{ text: request.systemPrompt }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${error}`);
      }

      const data: any = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    },
  };
}
