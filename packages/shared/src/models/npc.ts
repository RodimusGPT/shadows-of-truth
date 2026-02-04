export interface NpcPersonality {
  voice: string;
  speechPatterns: string[];
  backstory: string;
  mannerisms: string[];
}

export interface NpcRelationship {
  npcId: string;
  nature: string;
  knownByPlayer: boolean;
}

export interface KnowledgeBoundary {
  clueId: string;
  /** Trust level (0-100) at which this NPC will reveal this clue */
  revealThreshold: number;
  /** How the NPC hints at this info below the threshold */
  deflectionHint: string;
  /** The actual reveal dialogue guidance */
  revealGuidance: string;
}

export interface Npc {
  id: string;
  name: string;
  role: string;
  locationId: string;
  personality: NpcPersonality;
  relationships: NpcRelationship[];
  knowledgeBoundaries: KnowledgeBoundary[];
  /** Current trust level with the player (0-100) */
  trustLevel: number;
  /** Current emotional state — fed into prompt */
  mood: string;
  /** Whether the player has met this NPC */
  introduced: boolean;
}
