/**
 * Emergent Narrative System Types
 *
 * Instead of fixed solutions, cases define possibility spaces.
 * The player's investigation shapes which narrative becomes "true."
 */

/** A suspect with multiple possible motives and methods */
export interface Suspect {
  npcId: string;
  /** Possible motives this suspect could have */
  possibleMotives: string[];
  /** Possible methods this suspect could have used */
  possibleMethods: string[];
  /** Evidence that supports this suspect's guilt */
  supportingClueIds: string[];
  /** Evidence that suggests this suspect is innocent */
  exoneratingClueIds: string[];
}

/** An established fact in the narrative — something that "happened" based on NPC statements */
export interface EstablishedFact {
  id: string;
  /** The content of the fact */
  content: string;
  /** Who established this fact (NPC who stated it) */
  sourceNpcId: string;
  /** Turn when this was established */
  turn: number;
  /** Clues that support this fact */
  supportingClueIds: string[];
  /** Can this fact be contradicted later? */
  contradictable: boolean;
}

/** A theory the player has expressed during investigation */
export interface PlayerTheory {
  /** What the player suspects */
  content: string;
  /** Turn when expressed */
  turn: number;
  /** Suspect the theory implicates (if any) */
  suspectNpcId?: string;
}

/** Tracks the emerging narrative state */
export interface NarrativeMemory {
  /** Facts established through NPC dialogue */
  establishedFacts: EstablishedFact[];
  /** Theories the player has voiced */
  playerTheories: PlayerTheory[];
  /** NPCs the player has shown trust toward */
  trustedNpcs: string[];
  /** NPCs the player has antagonized */
  antagonizedNpcs: string[];
}

/** Player's formal accusation */
export interface Accusation {
  /** Who the player accuses */
  suspectNpcId: string;
  /** Player's stated motive */
  motive: string;
  /** Player's stated method */
  method: string;
  /** Player's reasoning/evidence */
  reasoning: string;
}

/** Result of evaluating an accusation */
export interface AccusationResult {
  /** Is the accusation coherent with established facts? */
  coherent: boolean;
  /** Coherence score 0-100 */
  coherenceScore: number;
  /** What supports the accusation */
  supportingEvidence: string[];
  /** What contradicts the accusation */
  contradictions: string[];
  /** Gaps in the reasoning */
  gaps: string[];
  /** The narrative resolution (if coherent) */
  resolution?: string;
}

/** State changes that can occur during narrative progression */
export interface NarrativeStateChange {
  /** New facts to establish */
  newFacts?: EstablishedFact[];
  /** Player theories detected from their messages */
  detectedTheories?: PlayerTheory[];
  /** NPCs whose relationship with player shifted significantly */
  relationshipShifts?: { npcId: string; direction: 'trust' | 'antagonize' }[];
}
