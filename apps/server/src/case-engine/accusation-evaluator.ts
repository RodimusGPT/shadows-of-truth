import {
  CaseDefinition,
  GameState,
  Accusation,
  AccusationResult,
  EstablishedFact,
  Suspect,
} from '@shadows/shared';
import { LlmProvider } from '../llm/types';

/**
 * Calculate dynamic coherence threshold based on game state.
 *
 * This function determines how much evidence the player needs to make
 * a successful accusation. Lower threshold = easier to convict.
 *
 * @param baseThreshold - The case's default threshold (typically 55-70)
 * @param state - Current game state with clues, NPCs, and narrative memory
 * @param accusation - The player's accusation
 * @param suspect - The suspect definition from the case (if emergent)
 * @returns Adjusted threshold (0-100)
 *
 * Consider these factors:
 * - discoveredClues: More evidence should make conviction easier
 * - failedAttempts: Anti-frustration — don't make players grind
 * - suspectEvidence: How much supporting vs exonerating evidence exists
 * - narrativeMemory: Has the player built a coherent theory over time?
 */
export function calculateDynamicThreshold(
  baseThreshold: number,
  state: GameState,
  accusation: Accusation,
  suspect?: Suspect
): number {
  let threshold = baseThreshold;

  // 1. General evidence bonus: -2 per discovered clue (rewards thorough investigation)
  const discoveredCount = state.clues.filter((c) => c.discovered).length;
  threshold -= discoveredCount * 2;

  if (suspect) {
    // 2. Suspect-specific evidence: -5 per supporting clue (rewards focused investigation)
    const supportingFound = suspect.supportingClueIds.filter((id) =>
      state.clues.find((c) => c.id === id)?.discovered
    ).length;
    threshold -= supportingFound * 5;

    // 3. Exonerating evidence penalty: +8 per clue that clears this suspect
    // Creates narrative tension — you FOUND evidence they're innocent!
    const exoneratingFound = suspect.exoneratingClueIds.filter((id) =>
      state.clues.find((c) => c.id === id)?.discovered
    ).length;
    threshold += exoneratingFound * 8;
  }

  // 4. Theory consistency: -3 per prior theory about this suspect (max -10)
  // Rewards players who've been building a narrative case
  const priorTheories =
    state.narrativeMemory?.playerTheories?.filter(
      (t) => t.suspectNpcId === accusation.suspectNpcId
    ).length ?? 0;
  threshold -= Math.min(priorTheories * 3, 10);

  // 5. Anti-frustration: -3 every 5 turns after turn 15 (max -15)
  // Long investigations shouldn't become punishing
  if (state.turn > 15) {
    threshold -= Math.min(Math.floor((state.turn - 15) / 5) * 3, 15);
  }

  // 6. Floor (25) and ceiling (85) — can't cheese, can't be impossible
  return Math.max(25, Math.min(85, threshold));
}

/**
 * Evaluates player accusations using LLM-based coherence checking.
 *
 * Instead of matching against a fixed solution, we ask the LLM:
 * "Given the established facts and discovered clues, is this accusation coherent?"
 */
export async function evaluateAccusation(
  accusation: Accusation,
  caseDefinition: CaseDefinition,
  state: GameState,
  llm: LlmProvider
): Promise<AccusationResult> {
  const discoveredClues = state.clues.filter((c) => c.discovered);
  const establishedFacts = state.narrativeMemory?.establishedFacts ?? [];
  const suspect = state.npcs.find((n) => n.id === accusation.suspectNpcId);

  if (!suspect) {
    return {
      coherent: false,
      coherenceScore: 0,
      supportingEvidence: [],
      contradictions: [`Unknown suspect: ${accusation.suspectNpcId}`],
      gaps: [],
    };
  }

  const prompt = buildEvaluationPrompt(
    accusation,
    suspect.name,
    caseDefinition,
    discoveredClues,
    establishedFacts
  );

  const response = await llm.generate({
    systemPrompt: EVALUATOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 1024,
    temperature: 0.3, // Low temp for consistent evaluation
  });

  return parseEvaluationResponse(response.content, accusation, caseDefinition);
}

const EVALUATOR_SYSTEM_PROMPT = `You are a narrative coherence evaluator for a mystery game.

Your job is to assess whether a player's accusation is COHERENT with the evidence they've gathered.
This is NOT about matching a predetermined answer — it's about narrative logic.

An accusation is coherent if:
1. The evidence supports the suspect having means, motive, and opportunity
2. There are no major contradictions with established facts
3. The reasoning follows logically from the clues

Be GENEROUS with coherence. Mystery stories work when player theories become truth.
Only reject accusations that are truly unsupported or contradicted.

Respond in this exact format:
<evaluation>
{
  "coherent": true/false,
  "coherenceScore": 0-100,
  "supportingEvidence": ["evidence point 1", "evidence point 2"],
  "contradictions": ["contradiction 1 if any"],
  "gaps": ["gap in reasoning if any"],
  "resolution": "If coherent, write 2-3 sentences describing how this accusation becomes the narrative truth"
}
</evaluation>`;

function buildEvaluationPrompt(
  accusation: Accusation,
  suspectName: string,
  caseDefinition: CaseDefinition,
  discoveredClues: { id: string; name: string; description: string }[],
  establishedFacts: EstablishedFact[]
): string {
  const clueList = discoveredClues
    .map((c) => `- ${c.name}: ${c.description}`)
    .join('\n');

  const factList =
    establishedFacts.length > 0
      ? establishedFacts.map((f) => `- ${f.content}`).join('\n')
      : '(No facts established yet)';

  const suspectInfo = caseDefinition.suspects?.find(
    (s) => s.npcId === accusation.suspectNpcId
  );
  const possibleMotives = suspectInfo?.possibleMotives.join(', ') ?? 'unknown';
  const possibleMethods = suspectInfo?.possibleMethods.join(', ') ?? 'unknown';

  return `CASE: ${caseDefinition.title}
SETTING: ${caseDefinition.setting}

PLAYER'S ACCUSATION:
- Suspect: ${suspectName}
- Motive: ${accusation.motive}
- Method: ${accusation.method}
- Reasoning: ${accusation.reasoning}

DISCOVERED CLUES:
${clueList || '(No clues discovered)'}

ESTABLISHED FACTS (from NPC conversations):
${factList}

SUSPECT'S POSSIBLE MOTIVES (per case design): ${possibleMotives}
SUSPECT'S POSSIBLE METHODS (per case design): ${possibleMethods}

Evaluate whether this accusation is coherent with the evidence.`;
}

function parseEvaluationResponse(
  content: string,
  accusation: Accusation,
  caseDefinition: CaseDefinition
): AccusationResult {
  const match = content.match(/<evaluation>([\s\S]*?)<\/evaluation>/);
  if (!match) {
    // Fallback: if LLM didn't follow format, be generous
    return {
      coherent: true,
      coherenceScore: 60,
      supportingEvidence: ['Evaluation could not be parsed — accepting by default'],
      contradictions: [],
      gaps: ['Full evaluation unavailable'],
      resolution: `${accusation.suspectNpcId} was indeed responsible. The truth emerges.`,
    };
  }

  try {
    const parsed = JSON.parse(match[1].trim());
    return {
      coherent: parsed.coherent ?? false,
      coherenceScore: parsed.coherenceScore ?? 0,
      supportingEvidence: parsed.supportingEvidence ?? [],
      contradictions: parsed.contradictions ?? [],
      gaps: parsed.gaps ?? [],
      resolution: parsed.resolution,
    };
  } catch {
    return {
      coherent: true,
      coherenceScore: 60,
      supportingEvidence: ['Evaluation parsing failed — accepting by default'],
      contradictions: [],
      gaps: [],
      resolution: `${accusation.suspectNpcId} was indeed responsible.`,
    };
  }
}

/**
 * Generates the narrative resolution when an accusation succeeds.
 * This weaves the player's theory into a satisfying conclusion.
 */
export async function generateResolution(
  accusation: Accusation,
  result: AccusationResult,
  caseDefinition: CaseDefinition,
  state: GameState,
  llm: LlmProvider
): Promise<string> {
  const suspect = state.npcs.find((n) => n.id === accusation.suspectNpcId);
  const discoveredClues = state.clues.filter((c) => c.discovered);

  const prompt = `Write a satisfying 3-4 paragraph narrative resolution for this mystery.

CASE: ${caseDefinition.title}
SETTING: ${caseDefinition.setting}
ATMOSPHERE: ${caseDefinition.atmosphere}

THE ACCUSATION (now truth):
- Culprit: ${suspect?.name}
- Motive: ${accusation.motive}
- Method: ${accusation.method}
- Player's reasoning: ${accusation.reasoning}

KEY EVIDENCE THAT SUPPORTED THIS:
${result.supportingEvidence.map((e) => `- ${e}`).join('\n')}

Write in the noir style of the setting. Make the player feel like a brilliant detective.
Weave in specific clues they discovered. End with a sense of closure.`;

  const response = await llm.generate({
    systemPrompt: `You are a noir mystery writer crafting the final revelation scene.
Write atmospheric, satisfying conclusions that honor the player's detective work.
Stay in the period and setting. Be dramatic but not overwrought.`,
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 512,
    temperature: 0.8,
  });

  return response.content;
}
