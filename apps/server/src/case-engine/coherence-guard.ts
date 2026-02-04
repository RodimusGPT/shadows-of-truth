import { CaseDefinition, GameState, StateChange, Npc } from '@shadows/shared';

export interface CoherenceResult {
  valid: boolean;
  sanitized: StateChange;
  violations: string[];
}

/**
 * Validates LLM-proposed state changes against the case definition and current game state.
 * Rejects fabricated clues, enforces trust thresholds, and caps trust deltas.
 */
export function validateStateChanges(
  proposed: StateChange,
  caseDefinition: CaseDefinition,
  state: GameState,
  targetNpc: Npc
): CoherenceResult {
  const violations: string[] = [];
  const sanitized: StateChange = {};

  // LLMs often return NPC names instead of IDs — build a lookup to resolve both
  const resolveNpcId = (key: string): string | null => {
    if (state.npcs.find((n) => n.id === key)) return key;
    const byName = state.npcs.find((n) => n.name.toLowerCase() === key.toLowerCase());
    return byName?.id ?? null;
  };

  // Validate new clues
  if (proposed.newClues && proposed.newClues.length > 0) {
    const validClues: string[] = [];
    for (const clueId of proposed.newClues) {
      const clueDef = caseDefinition.clues.find((c) => c.id === clueId);
      if (!clueDef) {
        violations.push(`Rejected fabricated clue: "${clueId}"`);
        continue;
      }
      const alreadyDiscovered = state.clues.find((c) => c.id === clueId)?.discovered;
      if (alreadyDiscovered) {
        violations.push(`Clue already discovered: "${clueId}"`);
        continue;
      }
      // Check trust threshold
      const boundary = targetNpc.knowledgeBoundaries.find((kb) => kb.clueId === clueId);
      if (boundary && targetNpc.trustLevel < boundary.revealThreshold) {
        violations.push(
          `Trust too low for clue "${clueId}": ${targetNpc.trustLevel}/${boundary.revealThreshold}`
        );
        continue;
      }
      // Check prerequisites
      const prereqsMet = clueDef.prerequisites.every(
        (pid) => state.clues.find((c) => c.id === pid)?.discovered
      );
      if (!prereqsMet) {
        violations.push(`Prerequisites not met for clue "${clueId}"`);
        continue;
      }
      validClues.push(clueId);
    }
    if (validClues.length > 0) {
      sanitized.newClues = validClues;
    }
  }

  // Validate and cap trust changes
  if (proposed.trustChange) {
    const validTrust: Record<string, number> = {};
    for (const [npcKey, delta] of Object.entries(proposed.trustChange)) {
      const npcId = resolveNpcId(npcKey);
      if (!npcId) {
        violations.push(`Unknown NPC for trust change: "${npcKey}"`);
        continue;
      }
      const npc = state.npcs.find((n) => n.id === npcId)!;
      // Cap trust delta to [-5, +5] per interaction
      const capped = Math.max(-5, Math.min(5, delta));
      if (capped !== delta) {
        violations.push(`Trust delta capped for "${npcId}": ${delta} → ${capped}`);
      }
      validTrust[npcId] = capped;
    }
    if (Object.keys(validTrust).length > 0) {
      sanitized.trustChange = validTrust;
    }
  }

  // Validate mood shifts
  if (proposed.npcMoodShift) {
    const validMoods: Record<string, string> = {};
    for (const [npcKey, mood] of Object.entries(proposed.npcMoodShift)) {
      const npcId = resolveNpcId(npcKey);
      if (!npcId) {
        violations.push(`Unknown NPC for mood shift: "${npcKey}"`);
        continue;
      }
      validMoods[npcId] = mood;
    }
    if (Object.keys(validMoods).length > 0) {
      sanitized.npcMoodShift = validMoods;
    }
  }

  // Validate location unlocks
  if (proposed.locationUnlock && proposed.locationUnlock.length > 0) {
    const validLocations: string[] = [];
    for (const locId of proposed.locationUnlock) {
      const loc = caseDefinition.locations.find((l) => l.id === locId);
      if (!loc) {
        violations.push(`Unknown location: "${locId}"`);
        continue;
      }
      validLocations.push(locId);
    }
    if (validLocations.length > 0) {
      sanitized.locationUnlock = validLocations;
    }
  }

  return {
    valid: violations.length === 0,
    sanitized,
    violations,
  };
}
