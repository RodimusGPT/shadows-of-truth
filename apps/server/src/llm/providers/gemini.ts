import { LlmProvider, LlmRequest, LlmResponse } from '../types';
import { GeneratedImage } from '@shadows/shared';

// Free tier models: gemini-2.0-flash-lite, gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-flash-8b
// Image generation model: gemini-2.0-flash-exp (supports image output)
// See: https://ai.google.dev/pricing

/** Image generation using Gemini image generation model */
export async function generateGeminiImage(
  apiKey: string,
  prompt: string
): Promise<GeneratedImage> {
  // Use gemini-2.5-flash-image for fast image generation
  // Alternative: gemini-3-pro-image-preview for higher quality
  const imageModel = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Generate an image: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini image generation error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: Array<{
          text?: string;
          inlineData?: { mimeType: string; data: string };
        }>;
      };
    }[];
  };

  // Find the image part in the response
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart?.inlineData) {
    // If no image, check for text response (might be an error or refusal)
    const textPart = parts.find((p) => p.text);
    if (textPart?.text) {
      throw new Error(`Gemini returned text instead of image: ${textPart.text.slice(0, 200)}`);
    }
    throw new Error('Gemini did not return an image');
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
    prompt,
    cacheKey: generateCacheKey(prompt),
  };
}

/** Generate a stable cache key from prompt */
function generateCacheKey(prompt: string): string {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `img_${Math.abs(hash).toString(36)}`;
}

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
