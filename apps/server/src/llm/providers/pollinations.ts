import { GeneratedImage } from '@shadows/shared';

/**
 * Pollinations.ai — Free image generation with no API key required.
 *
 * Simply constructs a URL with the prompt, fetches the image,
 * and returns it as base64.
 *
 * Limitations:
 * - No guaranteed uptime (community project)
 * - Limited control over model/parameters
 * - Good for testing, not production
 *
 * @see https://pollinations.ai
 */
export async function generatePollinationsImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    seed?: number;
    model?: string;
  } = {}
): Promise<GeneratedImage> {
  const { width = 1024, height = 576, seed, model = 'flux' } = options;

  // Build the URL with encoded prompt
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    model,
    nologo: 'true',
  });

  if (seed !== undefined) {
    params.set('seed', seed.toString());
  }

  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;

  // Fetch the image with retry logic
  let response: Response;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(url);
      if (response.ok) break;

      // 502/503 are temporary - retry
      if (response.status === 502 || response.status === 503) {
        lastError = new Error(`Pollinations temporarily unavailable (${response.status})`);
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); // Exponential backoff
        continue;
      }

      throw new Error(`Pollinations error (${response.status}): ${response.statusText}`);
    } catch (err) {
      lastError = err as Error;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  if (!response! || !response.ok) {
    throw lastError ?? new Error('Pollinations request failed after retries');
  }

  // Get image as buffer and convert to base64
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  // Determine mime type from response headers
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';

  return {
    base64,
    mimeType: contentType,
    prompt,
    cacheKey: generateCacheKey(prompt, seed),
  };
}

/** Generate stable cache key */
function generateCacheKey(prompt: string, seed?: number): string {
  const input = seed !== undefined ? `${prompt}_${seed}` : prompt;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `poll_${Math.abs(hash).toString(36)}`;
}
