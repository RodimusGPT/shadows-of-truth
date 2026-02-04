import { useEffect } from 'react';
import { useGameStore } from '../context/game-store';
import { storage } from '../services/storage';

export function useGameState() {
  const {
    gameState,
    isLoading,
    error,
    startNewGame,
    loadGame,
    getCurrentNpcs,
    getDiscoveredClues,
    getCurrentLocation,
  } = useGameStore();

  // Try to restore saved game on mount — but never clobber state that's already set
  useEffect(() => {
    if (!gameState && !isLoading) {
      storage.getCurrentGameId().then((id) => {
        // Re-check: gameState may have been set while we awaited storage
        const current = useGameStore.getState().gameState;
        if (id && !current) loadGame(id);
      });
    }
  }, []);

  return {
    gameState,
    isLoading,
    error,
    startNewGame,
    loadGame,
    currentNpcs: getCurrentNpcs(),
    discoveredClues: getDiscoveredClues(),
    currentLocation: getCurrentLocation(),
  };
}
