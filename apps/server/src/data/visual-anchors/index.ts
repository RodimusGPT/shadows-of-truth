import { NpcVisualAnchor, LocationVisualAnchor } from '@shadows/shared';
import {
  npcAnchors as heiressNpcs,
  locationAnchors as heiressLocations,
  styleModifiers,
  baseStyle,
} from './missing-heiress';

/** All NPC visual anchors indexed by caseId then npcId */
const npcAnchorsByCaseId: Record<string, Record<string, NpcVisualAnchor>> = {
  'missing-heiress': Object.fromEntries(heiressNpcs.map((a) => [a.npcId, a])),
};

/** All location visual anchors indexed by caseId then locationId */
const locationAnchorsByCaseId: Record<string, Record<string, LocationVisualAnchor>> = {
  'missing-heiress': Object.fromEntries(heiressLocations.map((a) => [a.locationId, a])),
};

/** Get NPC visual anchor for prompt building */
export function getNpcAnchor(caseId: string, npcId: string): NpcVisualAnchor | undefined {
  return npcAnchorsByCaseId[caseId]?.[npcId];
}

/** Get location visual anchor for prompt building */
export function getLocationAnchor(caseId: string, locationId: string): LocationVisualAnchor | undefined {
  return locationAnchorsByCaseId[caseId]?.[locationId];
}

/** Build a complete image prompt with anchors and style */
export function buildImagePrompt(
  caseId: string,
  scene: string,
  options: {
    npcId?: string;
    locationId?: string;
    style?: keyof typeof styleModifiers;
  } = {}
): string {
  const parts: string[] = [];

  // Add location context if specified
  if (options.locationId) {
    const loc = getLocationAnchor(caseId, options.locationId);
    if (loc) {
      parts.push(`Setting: ${loc.environment}`);
      parts.push(`Key elements: ${loc.keyElements.slice(0, 3).join(', ')}`);
      parts.push(`Atmosphere: ${loc.atmosphere}`);
    }
  }

  // Add NPC description if specified
  if (options.npcId) {
    const npc = getNpcAnchor(caseId, options.npcId);
    if (npc) {
      parts.push(`Character: ${npc.appearance}`);
      parts.push(`Wearing: ${npc.attire}`);
      parts.push(`Details: ${npc.distinctiveFeatures.slice(0, 2).join(', ')}`);
    }
  }

  // Add the specific scene description
  parts.push(`Scene: ${scene}`);

  // Add style modifiers
  if (options.style) {
    parts.push(`Style: ${styleModifiers[options.style]}`);
  }

  // Always add base noir style
  parts.push(baseStyle);

  return parts.join('\n\n');
}

export { styleModifiers, baseStyle };
