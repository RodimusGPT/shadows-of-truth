import { v4 as uuid } from 'uuid';
import { CaseDefinition, GameState, GameAction, StateChange, ChatMessage } from '@shadows/shared';
import { applyAction, applyActions } from './mutations';

/** In-memory game store — replace with persistence layer later */
const games = new Map<string, GameState>();

export function createGame(caseDefinition: CaseDefinition): GameState {
  const gameId = uuid();
  const state: GameState = {
    gameId,
    caseId: caseDefinition.id,
    turn: 0,
    currentLocationId: caseDefinition.locations[0].id,
    npcs: caseDefinition.npcs.map((npc) => ({ ...npc })),
    clues: caseDefinition.clues.map((clue) => ({ ...clue, discovered: false })),
    locations: caseDefinition.locations.map((loc, i) => ({
      ...loc,
      visited: i === 0,
    })),
    discoveredConnections: [],
    chatHistory: [],
    conversationSummary: '',
    solved: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  games.set(gameId, state);
  return state;
}

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function dispatch(gameId: string, action: GameAction): GameState {
  const state = games.get(gameId);
  if (!state) throw new Error(`Game not found: ${gameId}`);
  const next = applyAction(state, action);
  games.set(gameId, next);
  return next;
}

/** Convert sanitized StateChange into GameActions and apply them */
export function applyStateChanges(
  gameId: string,
  stateChanges: StateChange,
  turn: number
): GameState {
  const actions: GameAction[] = [];

  if (stateChanges.newClues) {
    for (const clueId of stateChanges.newClues) {
      actions.push({ type: 'DISCOVER_CLUE', clueId, turn });
    }
  }

  if (stateChanges.trustChange) {
    for (const [npcId, delta] of Object.entries(stateChanges.trustChange)) {
      actions.push({ type: 'UPDATE_TRUST', npcId, delta });
    }
  }

  if (stateChanges.npcMoodShift) {
    for (const [npcId, mood] of Object.entries(stateChanges.npcMoodShift)) {
      actions.push({ type: 'UPDATE_MOOD', npcId, mood });
    }
  }

  if (stateChanges.locationUnlock) {
    for (const locationId of stateChanges.locationUnlock) {
      actions.push({ type: 'UNLOCK_LOCATION', locationId });
    }
  }

  const state = games.get(gameId);
  if (!state) throw new Error(`Game not found: ${gameId}`);
  const next = applyActions(state, actions);
  games.set(gameId, next);
  return next;
}

export function addMessage(gameId: string, message: ChatMessage): GameState {
  return dispatch(gameId, { type: 'ADD_MESSAGE', message });
}

export function listGames(): GameState[] {
  return Array.from(games.values());
}
