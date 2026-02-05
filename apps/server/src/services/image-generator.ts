import { GeneratedImage } from '@shadows/shared';
import { generateGeminiImage } from '../llm/providers/gemini';
import { generatePollinationsImage } from '../llm/providers/pollinations';
import { generateHuggingFaceImage } from '../llm/providers/huggingface';
import { buildImagePrompt, styleModifiers } from '../data/visual-anchors';

/** Available image generation providers */
export type ImageProvider = 'huggingface' | 'pollinations' | 'gemini';

/** Get the configured image provider */
export function getImageProvider(): ImageProvider {
  const provider = process.env.IMAGE_PROVIDER as ImageProvider;
  if (provider === 'gemini') return 'gemini';
  if (provider === 'pollinations') return 'pollinations';
  return 'huggingface'; // Default to reliable free provider
}

/** In-memory cache for generated images */
const imageCache = new Map<string, GeneratedImage>();

/** Cache TTL: 24 hours */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  image: GeneratedImage;
  timestamp: number;
}

const cacheWithTimestamp = new Map<string, CacheEntry>();

// Cleanup expired cache entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cacheWithTimestamp) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cacheWithTimestamp.delete(key);
    }
  }
}, 60 * 60 * 1000);

export interface SceneImageRequest {
  /** Case ID for visual anchor lookup */
  caseId: string;
  /** Description of the scene to generate */
  scene: string;
  /** NPC featured in the scene (optional) */
  npcId?: string;
  /** Location of the scene (optional) */
  locationId?: string;
  /** Visual style */
  style?: keyof typeof styleModifiers;
  /** Skip cache and regenerate */
  forceRegenerate?: boolean;
}

/** Check if image generation is available */
export function isImageGenerationAvailable(): boolean {
  const provider = getImageProvider();
  // Free providers are always available
  if (provider === 'pollinations' || provider === 'huggingface') {
    return true;
  }
  // Gemini requires API key and explicit enable
  return !!process.env.GEMINI_API_KEY && process.env.ENABLE_IMAGE_GENERATION === 'true';
}

/**
 * Generate a scene image with consistent visual anchors.
 *
 * Uses cached images when available to ensure consistency
 * and reduce API calls.
 *
 * Providers:
 * - 'pollinations' (default): Free, no API key needed
 * - 'gemini': Requires GEMINI_API_KEY + ENABLE_IMAGE_GENERATION=true
 */
export async function generateSceneImage(
  request: SceneImageRequest
): Promise<GeneratedImage> {
  const provider = getImageProvider();

  // Build the full prompt with visual anchors
  const fullPrompt = buildImagePrompt(request.caseId, request.scene, {
    npcId: request.npcId,
    locationId: request.locationId,
    style: request.style ?? 'noir',
  });

  // Generate cache key from the full prompt
  const cacheKey = generateStableCacheKey(fullPrompt);

  // Check cache first (unless force regenerate)
  if (!request.forceRegenerate) {
    const cached = cacheWithTimestamp.get(cacheKey);
    if (cached) {
      return cached.image;
    }
  }

  // Generate new image based on provider
  let image: GeneratedImage;

  switch (provider) {
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY required for Gemini image generation');
      }
      image = await generateGeminiImage(apiKey, fullPrompt);
      break;
    }
    case 'pollinations': {
      image = await generatePollinationsImage(fullPrompt, {
        width: 1024,
        height: 576,
      });
      break;
    }
    case 'huggingface':
    default: {
      // Hugging Face (free, reliable, default)
      const hfKey = process.env.HUGGINGFACE_API_KEY; // Optional
      image = await generateHuggingFaceImage(fullPrompt, hfKey);
      break;
    }
  }

  // Cache the result
  cacheWithTimestamp.set(cacheKey, {
    image: { ...image, cacheKey },
    timestamp: Date.now(),
  });

  return { ...image, cacheKey };
}

/**
 * Generate a location establishing shot.
 * These are typically generated once and reused.
 */
export async function generateLocationImage(
  caseId: string,
  locationId: string
): Promise<GeneratedImage> {
  return generateSceneImage({
    caseId,
    locationId,
    scene: 'Wide establishing shot, cinematic composition, no people visible',
    style: 'noir',
  });
}

/**
 * Generate an NPC portrait.
 * These maintain character consistency through visual anchors.
 */
export async function generateNpcPortrait(
  caseId: string,
  npcId: string,
  mood?: string
): Promise<GeneratedImage> {
  const moodDescription = mood ? `, expression showing ${mood}` : '';
  return generateSceneImage({
    caseId,
    npcId,
    scene: `Portrait shot, head and shoulders, looking at camera${moodDescription}, dramatic noir lighting`,
    style: 'dramatic',
  });
}

/**
 * Generate a clue discovery image.
 * Focuses on the object, not faces — allows more visual flexibility.
 */
export async function generateClueImage(
  caseId: string,
  locationId: string,
  clueDescription: string
): Promise<GeneratedImage> {
  return generateSceneImage({
    caseId,
    locationId,
    scene: `Close-up detail shot: ${clueDescription}. Focus on the object, dramatic shadows, mystery and intrigue`,
    style: 'mysterious',
  });
}

/**
 * Generate a dramatic moment image (accusations, revelations).
 */
export async function generateDramaticMoment(
  caseId: string,
  locationId: string,
  description: string
): Promise<GeneratedImage> {
  return generateSceneImage({
    caseId,
    locationId,
    scene: description,
    style: 'tense',
  });
}

/** Generate stable cache key from prompt */
function generateStableCacheKey(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `scene_${Math.abs(hash).toString(36)}`;
}

/** Get all cached images (for debugging/admin) */
export function getCacheStats(): { count: number; keys: string[] } {
  return {
    count: cacheWithTimestamp.size,
    keys: Array.from(cacheWithTimestamp.keys()),
  };
}

/** Clear the image cache */
export function clearImageCache(): void {
  cacheWithTimestamp.clear();
}
