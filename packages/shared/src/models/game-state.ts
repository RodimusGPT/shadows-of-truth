import { Clue, ClueConnection } from './clue';
import { Npc } from './npc';
import { Location } from './location';
import { ChatMessage } from './chat';

export interface CaseDefinition {
  id: string;
  title: string;
  synopsis: string;
  setting: string;
  atmosphere: string;
  solution: string;
  npcs: Npc[];
  locations: Location[];
  clues: Clue[];
  clueConnections: ClueConnection[];
}

export interface GameState {
  gameId: string;
  caseId: string;
  /** Current turn number */
  turn: number;
  /** Player's current location */
  currentLocationId: string;
  /** All NPCs with their current state */
  npcs: Npc[];
  /** All clues with discovery status */
  clues: Clue[];
  /** All locations with visit status */
  locations: Location[];
  /** Clue connections discovered by the player */
  discoveredConnections: ClueConnection[];
  /** Full chat history */
  chatHistory: ChatMessage[];
  /** Summarized earlier conversation for token management */
  conversationSummary: string;
  /** Whether the case has been solved */
  solved: boolean;
  /** Timestamp of game creation */
  createdAt: number;
  /** Timestamp of last update */
  updatedAt: number;
}

export type GameAction =
  | { type: 'DISCOVER_CLUE'; clueId: string; turn: number }
  | { type: 'UPDATE_TRUST'; npcId: string; delta: number }
  | { type: 'UPDATE_MOOD'; npcId: string; mood: string }
  | { type: 'INTRODUCE_NPC'; npcId: string }
  | { type: 'MOVE_LOCATION'; locationId: string }
  | { type: 'UNLOCK_LOCATION'; locationId: string }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_SUMMARY'; summary: string }
  | { type: 'SOLVE_CASE' }
  | { type: 'INCREMENT_TURN' };
