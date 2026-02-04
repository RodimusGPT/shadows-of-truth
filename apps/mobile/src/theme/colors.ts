export const colors = {
  // Backgrounds
  bg: {
    primary: '#0A0A0F',
    secondary: '#12121A',
    card: '#1A1A24',
    elevated: '#222233',
  },

  // Text
  text: {
    primary: '#E8E4D9',     // Warm parchment white
    secondary: '#8B8677',   // Faded ink
    muted: '#5A5650',       // Barely visible
    accent: '#C4A35A',      // Gold — clue highlights, important text
  },

  // NPC dialogue colors
  npc: {
    dialogue: '#D4C9A8',    // Warm cream — NPC speech
    name: '#C4A35A',        // Gold — NPC names
  },

  // Player
  player: {
    dialogue: '#7A9BB5',    // Cool steel blue — player's words
    input: '#E8E4D9',
  },

  // Narrator
  narrator: {
    text: '#6B6B7B',        // Quiet grey — system/narrator
  },

  // UI accents
  accent: {
    gold: '#C4A35A',
    amber: '#D4A853',
    red: '#8B3A3A',         // Danger, blood
    blue: '#3A5A8B',        // Trust indicators
    green: '#3A6B3A',       // Success, clue found
  },

  // Borders & dividers
  border: {
    subtle: '#2A2A3A',
    visible: '#3A3A4A',
  },

  // Overlays
  overlay: {
    dark: 'rgba(10, 10, 15, 0.85)',
    medium: 'rgba(10, 10, 15, 0.6)',
    light: 'rgba(10, 10, 15, 0.3)',
  },
} as const;
