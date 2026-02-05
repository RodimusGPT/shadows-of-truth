import { create } from 'zustand';
import { GameState, ChatMessage, Npc, Clue, Location } from '@shadows/shared';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface GameStore {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startNewGame: (caseId: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  refreshState: () => Promise<void>;

  // Selectors (derived from gameState)
  getCurrentNpcs: () => Npc[];
  getDiscoveredClues: () => Clue[];
  getCurrentLocation: () => Location | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isLoading: false,
  error: null,

  startNewGame: async (caseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { gameId, state } = await api.newGame(caseId);
      set({ gameState: state, isLoading: false });
      // Save to storage in background — don't let it block or crash game creation
      storage.saveCurrentGameId(gameId).catch(() => {});
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { state } = await api.getGame(gameId);
      set({ gameState: state, isLoading: false });
    } catch (err) {
      // Game no longer exists on server (e.g. server restarted) — clear stale ID
      await storage.clearCurrentGame();
      set({ gameState: null, error: null, isLoading: false });
    }
  },

  refreshState: async () => {
    const state = get().gameState;
    if (!state) return;
    try {
      const { state: fresh } = await api.getGame(state.gameId);
      set({ gameState: fresh });
    } catch {
      // Game gone from server — silently ignore; chat store handles re-creation
    }
  },

  getCurrentNpcs: () => {
    const state = get().gameState;
    if (!state) return [];
    return state.npcs.filter((n) => n.locationId === state.currentLocationId);
  },

  getDiscoveredClues: () => {
    const state = get().gameState;
    if (!state) return [];
    return state.clues.filter((c) => c.discovered);
  },

  getCurrentLocation: () => {
    const state = get().gameState;
    if (!state) return null;
    return state.locations.find((l) => l.id === state.currentLocationId) ?? null;
  },
}));
