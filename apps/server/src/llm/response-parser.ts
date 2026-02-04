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

  // Parse state changes (works whether or not <dialogue> tags are present)
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
      stateChanges = {};
    }
  }

  // Extract dialogue: use <dialogue> tags if present, otherwise strip XML tags from raw
  let dialogue: string;
  if (dialogueMatch) {
    dialogue = dialogueMatch[1].trim();
  } else {
    // Fallback: strip any <state_changes> block and other XML tags from the response
    dialogue = raw
      .replace(/<state_changes>[\s\S]*?<\/state_changes>/g, '')
      .replace(/<\/?dialogue>/g, '')
      .trim();
  }

  return { dialogue, stateChanges, raw };
}
