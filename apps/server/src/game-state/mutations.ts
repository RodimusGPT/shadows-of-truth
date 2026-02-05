import { GameState, GameAction, ChatMessage } from '@shadows/shared';

/** Pure state reducer — returns a new GameState without mutating the original */
export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DISCOVER_CLUE':
      return {
        ...state,
        clues: state.clues.map((c) =>
          c.id === action.clueId
            ? { ...c, discovered: true, discoveredAtTurn: action.turn }
            : c
        ),
        updatedAt: Date.now(),
      };

    case 'UPDATE_TRUST':
      return {
        ...state,
        npcs: state.npcs.map((n) =>
          n.id === action.npcId
            ? { ...n, trustLevel: Math.max(0, Math.min(100, n.trustLevel + action.delta)) }
            : n
        ),
        updatedAt: Date.now(),
      };

    case 'UPDATE_MOOD':
      return {
        ...state,
        npcs: state.npcs.map((n) =>
          n.id === action.npcId ? { ...n, mood: action.mood } : n
        ),
        updatedAt: Date.now(),
      };

    case 'INTRODUCE_NPC':
      return {
        ...state,
        npcs: state.npcs.map((n) =>
          n.id === action.npcId ? { ...n, introduced: true } : n
        ),
        updatedAt: Date.now(),
      };

    case 'MOVE_LOCATION':
      return {
        ...state,
        currentLocationId: action.locationId,
        locations: state.locations.map((l) =>
          l.id === action.locationId ? { ...l, visited: true } : l
        ),
        updatedAt: Date.now(),
      };

    case 'UNLOCK_LOCATION':
      return {
        ...state,
        locations: state.locations.map((l) =>
          l.id === action.locationId ? { ...l, unlocked: true } : l
        ),
        updatedAt: Date.now(),
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.message],
        updatedAt: Date.now(),
      };

    case 'UPDATE_SUMMARY':
      return {
        ...state,
        conversationSummary: action.summary,
        updatedAt: Date.now(),
      };

    case 'SOLVE_CASE':
      return {
        ...state,
        solved: true,
        updatedAt: Date.now(),
      };

    case 'INCREMENT_TURN':
      return {
        ...state,
        turn: state.turn + 1,
        updatedAt: Date.now(),
      };

    default:
      return state;
  }
}

/** Apply multiple actions in sequence */
export function applyActions(state: GameState, actions: GameAction[]): GameState {
  return actions.reduce(applyAction, state);
}
