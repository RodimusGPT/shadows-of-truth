export type ChatRole = 'player' | 'npc' | 'narrator' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  npcId?: string;
  timestamp: number;
  /** Turn number in the game */
  turn: number;
}

export interface ChatRequest {
  gameId: string;
  message: string;
  /** Which NPC the player is talking to, or null for narrator/environment */
  targetNpcId?: string;
}

export interface StateChange {
  newClues?: string[];
  npcMoodShift?: Record<string, string>;
  trustChange?: Record<string, number>;
  locationUnlock?: string[];
}

export interface ChatResponse {
  dialogue: string;
  stateChanges: StateChange;
  message: ChatMessage;
}
