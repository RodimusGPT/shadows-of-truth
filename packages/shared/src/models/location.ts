export interface Location {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  /** NPC IDs present at this location */
  npcIds: string[];
  /** Clue IDs that can be found by investigating this location */
  searchableClueIds: string[];
  /** Location IDs reachable from here */
  connectedLocationIds: string[];
  /** Whether the player has visited this location */
  visited: boolean;
}
