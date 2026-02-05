import { useState, useEffect } from 'react';
import { api, ImageResponse } from '../services/api';

interface SceneImageState {
  base64: string | null;
  mimeType: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and cache scene images (locations, NPCs, clues)
 */
export function useLocationImage(gameId: string | undefined, locationId: string | undefined) {
  const [state, setState] = useState<SceneImageState>({
    base64: null,
    mimeType: 'image/jpeg',
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!gameId || !locationId) return;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    api.getLocationImage(gameId, locationId)
      .then((res) => {
        setState({
          base64: res.image.base64,
          mimeType: res.image.mimeType,
          isLoading: false,
          error: null,
        });
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: (err as Error).message,
        }));
      });
  }, [gameId, locationId]);

  return state;
}

export function useNpcPortrait(gameId: string | undefined, npcId: string | undefined) {
  const [state, setState] = useState<SceneImageState>({
    base64: null,
    mimeType: 'image/jpeg',
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!gameId || !npcId) return;

    setState((s) => ({ ...s, isLoading: true, error: null }));

    api.getNpcPortrait(gameId, npcId)
      .then((res) => {
        setState({
          base64: res.image.base64,
          mimeType: res.image.mimeType,
          isLoading: false,
          error: null,
        });
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: (err as Error).message,
        }));
      });
  }, [gameId, npcId]);

  return state;
}
