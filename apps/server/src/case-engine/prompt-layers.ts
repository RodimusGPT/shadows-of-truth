import { CaseDefinition, GameState, Npc, NarrativeMemory } from '@shadows/shared';

/** Layer 1: World Frame — immutable character constraint */
export function worldFrame(caseDefinition: CaseDefinition): string {
  return `You are a character in a mystery set in: ${caseDefinition.setting}
You must NEVER break character. All language, references, and knowledge must be period and setting-appropriate.
Never reference anything that wouldn't exist in this time and place.`;
}

/** Layer 2: Case Context — the specific mystery being investigated */
export function caseContext(caseDefinition: CaseDefinition): string {
  return `CASE: "${caseDefinition.title}"
SYNOPSIS: ${caseDefinition.synopsis}
SETTING: ${caseDefinition.setting}
ATMOSPHERE: ${caseDefinition.atmosphere}

Maintain this atmosphere in every response. The world should feel dangerous, beautiful, and morally complex.`;
}

/** Layer 3: NPC Personality — the specific character being portrayed */
export function npcPersonality(npc: Npc): string {
  return `You are playing ${npc.name}, ${npc.role}.
VOICE: ${npc.personality.voice}
SPEECH PATTERNS: ${npc.personality.speechPatterns.join('; ')}
BACKSTORY: ${npc.personality.backstory}
MANNERISMS: ${npc.personality.mannerisms.join('; ')}
CURRENT MOOD: ${npc.mood}

Stay in character as ${npc.name} at all times. Your speech should reflect your voice and patterns.`;
}

/** Layer 4: Knowledge Boundary — what this NPC knows and when they'll reveal it */
export function knowledgeBoundary(npc: Npc): string {
  const boundaries = npc.knowledgeBoundaries
    .map((kb) => {
      const status =
        npc.trustLevel >= kb.revealThreshold
          ? `UNLOCKED — you may reveal: ${kb.revealGuidance}`
          : `LOCKED (trust ${npc.trustLevel}/${kb.revealThreshold}) — deflect with: ${kb.deflectionHint}`;
      return `- Clue "${kb.clueId}": ${status}`;
    })
    .join('\n');

  return `KNOWLEDGE BOUNDARIES (current trust level: ${npc.trustLevel}/100):
${boundaries}

You must NEVER reveal information from LOCKED clues. Use the deflection hints to redirect.
If the player pushes, you can hint that trust must be earned, but never reveal specifics.`;
}

/** Layer 5: Current Game State — dynamic context */
export function currentGameState(state: GameState, caseDefinition: CaseDefinition): string {
  const discoveredClues = state.clues.filter((c) => c.discovered).map((c) => c.name);
  const currentLocation = state.locations.find((l) => l.id === state.currentLocationId);
  const npcTrust = state.npcs.map((n) => `${n.name}: ${n.trustLevel}/100`);

  let narrativeContext = '';
  if (state.narrativeMemory) {
    narrativeContext = formatNarrativeMemory(state.narrativeMemory);
  }

  return `CURRENT GAME STATE (Turn ${state.turn}):
LOCATION: ${currentLocation?.name ?? 'Unknown'}
CLUES DISCOVERED (${discoveredClues.length}/${state.clues.length}): ${discoveredClues.join(', ') || 'None'}
NPC TRUST LEVELS: ${npcTrust.join(', ')}
${narrativeContext}
${state.conversationSummary ? `EARLIER CONVERSATION SUMMARY:\n${state.conversationSummary}` : ''}`;
}

/** Format narrative memory for prompt injection */
function formatNarrativeMemory(memory: NarrativeMemory): string {
  const parts: string[] = [];

  if (memory.establishedFacts.length > 0) {
    const facts = memory.establishedFacts.map((f) => `- ${f.content}`).join('\n');
    parts.push(`ESTABLISHED FACTS (treat as true in the narrative):\n${facts}`);
  }

  if (memory.playerTheories.length > 0) {
    const theories = memory.playerTheories.slice(-3).map((t) => `- ${t.content}`).join('\n');
    parts.push(`PLAYER'S CURRENT THEORIES:\n${theories}`);
  }

  return parts.length > 0 ? '\n' + parts.join('\n') : '';
}

/** Layer 6: Output Format Contract */
export function outputFormat(): string {
  return `FORMAT your response as:
<dialogue>[In-character response]</dialogue>
<state_changes>{"new_clues":[],"trust_change":{},"npc_mood_shift":{},"location_unlock":[]}</state_changes>

state_changes: new_clues=discovered clue IDs, trust_change=NPC ID to delta (-10 to +10), npc_mood_shift=NPC ID to new mood, location_unlock=newly accessible location IDs. Only include changed fields.`;
}

/** Layer 7: Guardrails — hard constraints */
export function guardrails(caseDefinition: CaseDefinition): string {
  const isEmergent = caseDefinition.suspects && caseDefinition.suspects.length > 0;

  if (isEmergent) {
    // Emergent narrative: no fixed solution to protect
    return `RULES: Never fabricate clues/characters/locations outside the case definition. Stay in period. Never break character or acknowledge being AI. Keep responses under 200 words. Trust changes: +1 to +3 (good), -1 to -5 (bad). In emergent mode: respond authentically to accusations — you may confess if cornered with sufficient evidence.`;
  }

  // Fixed solution mode
  const solutionHint = caseDefinition.solution?.slice(0, 50) ?? 'undisclosed';
  return `RULES: Never reveal solution ("${solutionHint}..."). Never fabricate clues/characters/locations. Stay in period. Never break character or acknowledge being AI. Keep responses under 200 words. Trust changes: +1 to +3 (good), -1 to -5 (bad).`;
}

/** Assemble all 7 layers into a complete system prompt */
export function buildSystemPrompt(
  caseDefinition: CaseDefinition,
  state: GameState,
  targetNpc: Npc
): string {
  return [
    worldFrame(caseDefinition),
    caseContext(caseDefinition),
    npcPersonality(targetNpc),
    knowledgeBoundary(targetNpc),
    currentGameState(state, caseDefinition),
    outputFormat(),
    guardrails(caseDefinition),
  ].join('\n\n---\n\n');
}
