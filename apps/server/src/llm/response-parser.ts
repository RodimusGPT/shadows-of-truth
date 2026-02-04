import { z } from 'zod';
import { StateChange } from '@shadows/shared';

const StateChangeSchema = z.object({
  new_clues: z.array(z.string()).optional().default([]),
  npc_mood_shift: z.record(z.string()).optional().default({}),
  trust_change: z.record(z.number()).optional().default({}),
  location_unlock: z.array(z.string()).optional().default([]),
});

export interface ParsedResponse {
  dialogue: string;
  stateChanges: StateChange;
  raw: string;
}

export function parseResponse(raw: string): ParsedResponse {
  const dialogueMatch = raw.match(/<dialogue>([\s\S]*?)<\/dialogue>/);
  const stateMatch = raw.match(/<state_changes>([\s\S]*?)<\/state_changes>/);

  if (!dialogueMatch) {
    // Fallback: treat entire response as dialogue with no state changes
    return {
      dialogue: raw.trim(),
      stateChanges: {},
      raw,
    };
  }

  const dialogue = dialogueMatch[1].trim();

  let stateChanges: StateChange = {};
  if (stateMatch) {
    try {
      const parsed = JSON.parse(stateMatch[1].trim());
      const validated = StateChangeSchema.parse(parsed);
      stateChanges = {
        newClues: validated.new_clues.length > 0 ? validated.new_clues : undefined,
        npcMoodShift: Object.keys(validated.npc_mood_shift).length > 0 ? validated.npc_mood_shift : undefined,
        trustChange: Object.keys(validated.trust_change).length > 0 ? validated.trust_change : undefined,
        locationUnlock: validated.location_unlock.length > 0 ? validated.location_unlock : undefined,
      };
    } catch {
      // If state_changes JSON is malformed, proceed with just dialogue
      stateChanges = {};
    }
  }

  return { dialogue, stateChanges, raw };
}
