import { describe, it, expect } from 'vitest';
import { applyAction, applyActions } from '../game-state/mutations';
import { missingHeiress } from '../data/cases/missing-heiress';
import { GameState } from '@shadows/shared';

function makeTestState(): GameState {
  return {
    gameId: 'test',
    caseId: 'missing-heiress',
    turn: 0,
    currentLocationId: 'mansion',
    npcs: missingHeiress.npcs.map((n) => ({ ...n })),
    clues: missingHeiress.clues.map((c) => ({ ...c, discovered: false })),
    locations: missingHeiress.locations.map((l) => ({ ...l })),
    discoveredConnections: [],
    chatHistory: [],
    conversationSummary: '',
    solved: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

describe('state mutations', () => {
  it('does not mutate the original state', () => {
    const state = makeTestState();
    const original = JSON.stringify(state);

    applyAction(state, { type: 'DISCOVER_CLUE', clueId: 'guest-list', turn: 1 });

    expect(JSON.stringify(state)).toBe(original);
  });

  it('discovers a clue', () => {
    const state = makeTestState();
    const next = applyAction(state, { type: 'DISCOVER_CLUE', clueId: 'guest-list', turn: 3 });

    const clue = next.clues.find((c) => c.id === 'guest-list');
    expect(clue?.discovered).toBe(true);
    expect(clue?.discoveredAtTurn).toBe(3);
  });

  it('updates trust within bounds', () => {
    const state = makeTestState();
    const harold = state.npcs.find((n) => n.id === 'harold')!;
    const initialTrust = harold.trustLevel;

    const next = applyAction(state, { type: 'UPDATE_TRUST', npcId: 'harold', delta: 10 });
    const updatedHarold = next.npcs.find((n) => n.id === 'harold')!;
    expect(updatedHarold.trustLevel).toBe(initialTrust + 10);
  });

  it('clamps trust to 0-100', () => {
    const state = makeTestState();
    const next = applyAction(state, { type: 'UPDATE_TRUST', npcId: 'harold', delta: -100 });
    const harold = next.npcs.find((n) => n.id === 'harold')!;
    expect(harold.trustLevel).toBe(0);
  });

  it('moves location and marks visited', () => {
    const state = makeTestState();
    const next = applyAction(state, { type: 'MOVE_LOCATION', locationId: 'blue-moon' });

    expect(next.currentLocationId).toBe('blue-moon');
    const loc = next.locations.find((l) => l.id === 'blue-moon');
    expect(loc?.visited).toBe(true);
  });

  it('applies multiple actions in sequence', () => {
    const state = makeTestState();
    const next = applyActions(state, [
      { type: 'INCREMENT_TURN' },
      { type: 'DISCOVER_CLUE', clueId: 'guest-list', turn: 1 },
      { type: 'UPDATE_TRUST', npcId: 'harold', delta: 3 },
    ]);

    expect(next.turn).toBe(1);
    expect(next.clues.find((c) => c.id === 'guest-list')?.discovered).toBe(true);
    expect(next.npcs.find((n) => n.id === 'harold')?.trustLevel).toBe(33);
  });
});
