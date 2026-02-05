import { create } from 'zustand';
import { ChatMessage, ChatResponse, StateChange } from '@shadows/shared';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { useGameStore } from './game-store';

interface ChatStore {
  messages: ChatMessage[];
  isSending: boolean;
  lastStateChanges: StateChange | null;

  sendMessage: (message: string, targetNpcId?: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isSending: false,
  lastStateChanges: null,

  sendMessage: async (message: string, targetNpcId?: string) => {
    const gameState = useGameStore.getState().gameState;
    if (!gameState) return;

    // Optimistic: add player message immediately
    const playerMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'player',
      content: message,
      timestamp: Date.now(),
      turn: gameState.turn,
    };
    set((s) => ({ messages: [...s.messages, playerMsg], isSending: true }));

    try {
      const response: ChatResponse = await api.chat({
        gameId: gameState.gameId,
        message,
        targetNpcId,
      });

      set((s) => ({
        messages: [...s.messages, response.message],
        isSending: false,
        lastStateChanges: response.stateChanges,
      }));

      // Refresh full game state to pick up all changes
      await useGameStore.getState().refreshState();
    } catch (err) {
      const errMsg = (err as Error).message ?? '';

      // Server lost the game (restarted / hibernated) — auto-recreate
      if (errMsg.includes('404')) {
        try {
          const { gameId, state } = await api.newGame(gameState.caseId);
          useGameStore.setState({ gameState: state, error: null });
          await storage.saveCurrentGameId(gameId);

          // Retry the message on the fresh game
          const retryResponse: ChatResponse = await api.chat({
            gameId,
            message,
            targetNpcId,
          });
          set((s) => ({
            messages: [...s.messages, retryResponse.message],
            isSending: false,
            lastStateChanges: retryResponse.stateChanges,
          }));
          await useGameStore.getState().refreshState();
          return;
        } catch {
          // Fall through to generic error
        }
      }

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'The line went dead. Try again.',
        timestamp: Date.now(),
        turn: gameState.turn,
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isSending: false,
      }));
    }
  },

  clearMessages: () => set({ messages: [], lastStateChanges: null }),
}));
