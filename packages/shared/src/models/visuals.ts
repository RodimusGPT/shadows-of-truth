/**
 * Visual Anchors — Consistent descriptions for image generation
 *
 * These descriptions are injected into every image prompt to maintain
 * character and location consistency across generated images.
 */

/** Visual description anchor for NPCs */
export interface NpcVisualAnchor {
  npcId: string;
  /** Physical appearance description for image prompts */
  appearance: string;
  /** Typical clothing/attire */
  attire: string;
  /** Distinctive visual features */
  distinctiveFeatures: string[];
}

/** Visual description anchor for locations */
export interface LocationVisualAnchor {
  locationId: string;
  /** Architectural/environmental description */
  environment: string;
  /** Key visual elements always present */
  keyElements: string[];
  /** Lighting and atmosphere */
  atmosphere: string;
}

/** Image generation request */
export interface ImageGenerationRequest {
  /** The scene to generate */
  prompt: string;
  /** NPC to feature (will inject visual anchor) */
  npcId?: string;
  /** Location context (will inject visual anchor) */
  locationId?: string;
  /** Style modifiers */
  style?: 'noir' | 'dramatic' | 'mysterious' | 'tense';
  /** Aspect ratio */
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

/** Generated image result */
export interface GeneratedImage {
  /** Base64 encoded image data */
  base64: string;
  /** MIME type (image/png, image/webp, etc.) */
  mimeType: string;
  /** Prompt used to generate */
  prompt: string;
  /** Cache key for retrieval */
  cacheKey: string;
}
