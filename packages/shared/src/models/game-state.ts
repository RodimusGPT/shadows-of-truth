import { Clue, ClueConnection } from './clue';
import { Npc } from './npc';
import { Location } from './location';
import { ChatMessage } from './chat';
import { Suspect, NarrativeMemory, EstablishedFact } from './narrative';

export interface CaseDefinition {
  id: string;
  title: string;
  synopsis: string;
  setting: string;
  atmosphere: string;
  /**
   * For fixed-solution cases: the predetermined truth
   * For emergent cases: leave empty or use as "canonical" reference
   */
  solution?: string;
  /**
   * For emergent narrative: suspects with possible motives/methods
   * If present, enables emergent narrative mode
   */
  suspects?: Suspect[];
  /**
   * Minimum coherence score (0-100) for an accusation to succeed
   * Default: 60
   */
  coherenceThreshold?: number;
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
  /** Emergent narrative memory — tracks established facts and player theories */
  narrativeMemory?: NarrativeMemory;
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
  | { type: 'INCREMENT_TURN' }
  // Emergent narrative actions
  | { type: 'ESTABLISH_FACT'; fact: EstablishedFact }
  | { type: 'RECORD_THEORY'; theory: { content: string; suspectNpcId?: string }; turn: number }
  | { type: 'SHIFT_RELATIONSHIP'; npcId: string; direction: 'trust' | 'antagonize' };
