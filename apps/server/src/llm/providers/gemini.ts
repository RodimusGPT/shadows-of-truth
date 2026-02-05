import { LlmProvider, LlmRequest, LlmResponse } from '../types';

// Free tier models: gemini-2.0-flash-lite, gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-flash-8b
// See: https://ai.google.dev/pricing
export function createGeminiProvider(apiKey: string, model?: string): LlmProvider {
  const geminiModel = model ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-lite';
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
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey, // Header auth instead of URL param
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${error}`);
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini API returned unexpected response structure');
      }
      return {
        content,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    },
  };
}
