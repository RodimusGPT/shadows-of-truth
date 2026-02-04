import { describe, it, expect } from 'vitest';
import { validateStateChanges } from '../case-engine/coherence-guard';
import { missingHeiress } from '../data/cases/missing-heiress';
import { GameState, StateChange } from '@shadows/shared';

function makeTestState(): GameState {
  return {
    gameId: 'test',
    caseId: 'missing-heiress',
    turn: 5,
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

describe('coherence guard', () => {
  it('rejects fabricated clues not in case definition', () => {
    const state = makeTestState();
    const proposed: StateChange = {
      newClues: ['fake-clue-that-doesnt-exist'],
    };
    const npc = state.npcs.find((n) => n.id === 'harold')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('fabricated');
    expect(result.sanitized.newClues).toBeUndefined();
  });

  it('accepts valid clues that meet trust threshold', () => {
    const state = makeTestState();
    // Harold has trust 30, vivian-argument needs threshold 20
    const proposed: StateChange = {
      newClues: ['vivian-argument'],
    };
    const npc = state.npcs.find((n) => n.id === 'harold')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.sanitized.newClues).toEqual(['vivian-argument']);
  });

  it('rejects clues when trust is too low', () => {
    const state = makeTestState();
    // Harold has trust 30, shipping-records needs threshold 80
    const proposed: StateChange = {
      newClues: ['shipping-records'],
    };
    const npc = state.npcs.find((n) => n.id === 'harold')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('Trust too low');
    expect(result.sanitized.newClues).toBeUndefined();
  });

  it('caps trust deltas to [-5, +5]', () => {
    const state = makeTestState();
    const proposed: StateChange = {
      trustChange: { harold: 15 },
    };
    const npc = state.npcs.find((n) => n.id === 'harold')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.sanitized.trustChange?.harold).toBe(5);
    expect(result.violations[0]).toContain('capped');
  });

  it('rejects already-discovered clues', () => {
    const state = makeTestState();
    state.clues = state.clues.map((c) =>
      c.id === 'guest-list' ? { ...c, discovered: true } : c
    );
    const proposed: StateChange = {
      newClues: ['guest-list'],
    };
    const npc = state.npcs.find((n) => n.id === 'harold')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.violations[0]).toContain('already discovered');
  });

  it('rejects clues with unmet prerequisites', () => {
    const state = makeTestState();
    // love-letters requires vivian-room to be discovered first
    const proposed: StateChange = {
      newClues: ['love-letters'],
    };
    const npc = state.npcs.find((n) => n.id === 'dorothy')!;

    const result = validateStateChanges(proposed, missingHeiress, state, npc);

    expect(result.violations[0]).toContain('Prerequisites not met');
  });
});
