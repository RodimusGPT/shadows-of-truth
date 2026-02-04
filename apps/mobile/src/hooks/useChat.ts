import { useCallback, useRef } from 'react';
import { useChatStore } from '../context/chat-store';
import { useGameStore } from '../context/game-store';

export function useChat() {
  const { messages, isSending, lastStateChanges, sendMessage } = useChatStore();
  const gameState = useGameStore((s) => s.gameState);
  const inputRef = useRef('');

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;
      await sendMessage(text.trim());
    },
    [isSending, sendMessage]
  );

  const currentNpc = gameState?.npcs.find(
    (n) => n.locationId === gameState.currentLocationId
  );

  return {
    messages,
    isSending,
    lastStateChanges,
    send,
    currentNpc,
    inputRef,
  };
}
