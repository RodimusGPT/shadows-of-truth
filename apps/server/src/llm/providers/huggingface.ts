import { GeneratedImage } from '@shadows/shared';

/**
 * Hugging Face Inference API — Free tier image generation.
 *
 * Uses the new router.huggingface.co endpoint (as of 2025).
 * Requires API key for authentication.
 *
 * @see https://huggingface.co/docs/api-inference/
 */
export async function generateHuggingFaceImage(
  prompt: string,
  apiKey?: string
): Promise<GeneratedImage> {
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is required for image generation');
  }

  // Use FLUX.1-schnell for fast generation, or SDXL as fallback
  const model = process.env.HF_IMAGE_MODEL ?? 'black-forest-labs/FLUX.1-schnell';
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    // Check if it's a model loading message
    if (response.status === 503) {
      throw new Error('Model is loading, please try again in ~20 seconds');
    }
    throw new Error(`Hugging Face error (${response.status}): ${error.slice(0, 200)}`);
  }

  // Response is raw image bytes
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';

  return {
    base64,
    mimeType: contentType,
    prompt,
    cacheKey: generateCacheKey(prompt),
  };
}

/** Generate stable cache key */
function generateCacheKey(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `hf_${Math.abs(hash).toString(36)}`;
}
