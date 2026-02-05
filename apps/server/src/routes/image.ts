import { FastifyInstance } from 'fastify';
import { getGame } from '../game-state';
import { cases } from '../data/cases';
import {
  generateSceneImage,
  generateLocationImage,
  generateNpcPortrait,
  generateClueImage,
  getCacheStats,
  isImageGenerationAvailable,
  getImageProvider,
} from '../services/image-generator';

interface LocationImageParams {
  gameId: string;
  locationId: string;
}

interface NpcPortraitParams {
  gameId: string;
  npcId: string;
}

interface ClueImageBody {
  gameId: string;
  clueId: string;
}

interface SceneImageBody {
  gameId: string;
  scene: string;
  npcId?: string;
  locationId?: string;
  style?: 'noir' | 'dramatic' | 'mysterious' | 'tense';
}

export async function imageRoutes(app: FastifyInstance) {
  /**
   * GET /api/image/location/:gameId/:locationId
   * Generate or retrieve cached location establishing shot
   */
  app.get<{ Params: LocationImageParams }>(
    '/api/image/location/:gameId/:locationId',
    async (request, reply) => {
      const { gameId, locationId } = request.params;

      const state = getGame(gameId);
      if (!state) {
        return reply.status(404).send({ error: 'Game not found' });
      }

      const location = state.locations.find((l) => l.id === locationId);
      if (!location) {
        return reply.status(404).send({ error: 'Location not found' });
      }

      try {
        const image = await generateLocationImage(state.caseId, locationId);
        return {
          locationId,
          locationName: location.name,
          image: {
            base64: image.base64,
            mimeType: image.mimeType,
            cacheKey: image.cacheKey,
          },
        };
      } catch (err) {
        app.log.error(err, 'Failed to generate location image');
        return reply.status(500).send({
          error: 'Image generation failed',
          message: (err as Error).message,
        });
      }
    }
  );

  /**
   * GET /api/image/npc/:gameId/:npcId
   * Generate or retrieve cached NPC portrait
   */
  app.get<{ Params: NpcPortraitParams }>(
    '/api/image/npc/:gameId/:npcId',
    async (request, reply) => {
      const { gameId, npcId } = request.params;

      const state = getGame(gameId);
      if (!state) {
        return reply.status(404).send({ error: 'Game not found' });
      }

      const npc = state.npcs.find((n) => n.id === npcId);
      if (!npc) {
        return reply.status(404).send({ error: 'NPC not found' });
      }

      try {
        const image = await generateNpcPortrait(state.caseId, npcId, npc.mood);
        return {
          npcId,
          npcName: npc.name,
          mood: npc.mood,
          image: {
            base64: image.base64,
            mimeType: image.mimeType,
            cacheKey: image.cacheKey,
          },
        };
      } catch (err) {
        app.log.error(err, 'Failed to generate NPC portrait');
        return reply.status(500).send({
          error: 'Image generation failed',
          message: (err as Error).message,
        });
      }
    }
  );

  /**
   * POST /api/image/clue
   * Generate image for a discovered clue
   */
  app.post<{ Body: ClueImageBody }>('/api/image/clue', async (request, reply) => {
    const { gameId, clueId } = request.body;

    if (!gameId || !clueId) {
      return reply.status(400).send({ error: 'gameId and clueId required' });
    }

    const state = getGame(gameId);
    if (!state) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    const clue = state.clues.find((c) => c.id === clueId);
    if (!clue) {
      return reply.status(404).send({ error: 'Clue not found' });
    }

    // Find the location where this clue was found
    const caseDef = cases[state.caseId];
    const clueSource = caseDef?.clues.find((c) => c.id === clueId)?.sourceId;
    const locationId = caseDef?.locations.find((l) => l.id === clueSource)?.id;

    try {
      const image = await generateClueImage(
        state.caseId,
        locationId ?? state.currentLocationId,
        `${clue.name}: ${clue.description}`
      );
      return {
        clueId,
        clueName: clue.name,
        image: {
          base64: image.base64,
          mimeType: image.mimeType,
          cacheKey: image.cacheKey,
        },
      };
    } catch (err) {
      app.log.error(err, 'Failed to generate clue image');
      return reply.status(500).send({
        error: 'Image generation failed',
        message: (err as Error).message,
      });
    }
  });

  /**
   * POST /api/image/scene
   * Generate a custom scene image
   */
  app.post<{ Body: SceneImageBody }>('/api/image/scene', async (request, reply) => {
    const { gameId, scene, npcId, locationId, style } = request.body;

    if (!gameId || !scene) {
      return reply.status(400).send({ error: 'gameId and scene required' });
    }

    const state = getGame(gameId);
    if (!state) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    try {
      const image = await generateSceneImage({
        caseId: state.caseId,
        scene,
        npcId,
        locationId: locationId ?? state.currentLocationId,
        style,
      });
      return {
        scene,
        image: {
          base64: image.base64,
          mimeType: image.mimeType,
          cacheKey: image.cacheKey,
        },
      };
    } catch (err) {
      app.log.error(err, 'Failed to generate scene image');
      return reply.status(500).send({
        error: 'Image generation failed',
        message: (err as Error).message,
      });
    }
  });

  /**
   * GET /api/image/cache/stats
   * Debug endpoint to view cache statistics
   */
  app.get('/api/image/cache/stats', async () => {
    return getCacheStats();
  });

  /**
   * GET /api/image/status
   * Check if image generation is available
   */
  app.get('/api/image/status', async () => {
    const available = isImageGenerationAvailable();
    const provider = getImageProvider();

    const providerInfo: Record<string, string> = {
      huggingface: 'Using free Hugging Face FLUX.1-schnell — no API key required (optional key for higher limits)',
      pollinations: 'Using free Pollinations.ai — no API key required',
      gemini: `Using Gemini model: ${process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'}`,
    };

    return {
      available,
      provider,
      message: available
        ? `Image generation enabled using ${provider}`
        : 'Image generation is disabled.',
      info: providerInfo[provider] ?? 'Unknown provider',
    };
  });
}
