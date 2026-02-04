import { describe, it, expect } from 'vitest';
import { parseResponse } from '../llm/response-parser';

describe('parseResponse', () => {
  it('parses valid XML-delimited response', () => {
    const raw = `<dialogue>The name's Ashworth. What do you want?</dialogue>
<state_changes>{"new_clues":[],"npc_mood_shift":{"harold":"suspicious"},"trust_change":{"harold":1},"location_unlock":[]}</state_changes>`;

    const result = parseResponse(raw);

    expect(result.dialogue).toBe("The name's Ashworth. What do you want?");
    expect(result.stateChanges.npcMoodShift).toEqual({ harold: 'suspicious' });
    expect(result.stateChanges.trustChange).toEqual({ harold: 1 });
  });

  it('handles response with no state changes', () => {
    const raw = `<dialogue>I don't know nothing about nothing.</dialogue>
<state_changes>{}</state_changes>`;

    const result = parseResponse(raw);

    expect(result.dialogue).toBe("I don't know nothing about nothing.");
    expect(result.stateChanges).toEqual({});
  });

  it('falls back to raw content when no XML tags present', () => {
    const raw = 'Just some plain text response from the LLM.';
    const result = parseResponse(raw);

    expect(result.dialogue).toBe(raw);
    expect(result.stateChanges).toEqual({});
  });

  it('handles malformed JSON in state_changes gracefully', () => {
    const raw = `<dialogue>Hello there.</dialogue>
<state_changes>{broken json</state_changes>`;

    const result = parseResponse(raw);

    expect(result.dialogue).toBe('Hello there.');
    expect(result.stateChanges).toEqual({});
  });

  it('parses new clues correctly', () => {
    const raw = `<dialogue>Here, look at this letter.</dialogue>
<state_changes>{"new_clues":["love-letters"],"npc_mood_shift":{},"trust_change":{"dorothy":2},"location_unlock":[]}</state_changes>`;

    const result = parseResponse(raw);

    expect(result.stateChanges.newClues).toEqual(['love-letters']);
    expect(result.stateChanges.trustChange).toEqual({ dorothy: 2 });
  });
});
