export interface Clue {
  id: string;
  name: string;
  description: string;
  /** Which NPC or location can reveal this clue */
  sourceId: string;
  /** Minimum trust level required to obtain this clue */
  trustThreshold: number;
  /** Clue IDs that must be found before this one becomes available */
  prerequisites: string[];
  /** Whether the player has discovered this clue */
  discovered: boolean;
  /** Turn number when discovered */
  discoveredAtTurn?: number;
  /** Tags for filtering and grouping (e.g., "physical", "testimony", "document") */
  tags: string[];
}

export interface ClueConnection {
  fromClueId: string;
  toClueId: string;
  /** How discovering 'from' relates to 'to' — shown in notebook */
  relationship: string;
}
