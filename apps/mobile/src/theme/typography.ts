import { TextStyle } from 'react-native';

export const fonts = {
  // Using system fonts that evoke noir feeling
  // Can be replaced with custom fonts via expo-font
  serif: 'System',       // Replace with a serif like 'Playfair Display' or 'Libre Baskerville'
  sans: 'System',        // Replace with 'Inter' or similar
  mono: 'Courier',       // Typewriter feel for narrator text
} as const;

export const typography: Record<string, TextStyle> = {
  // Headers
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  // Body
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Dialogue
  npcDialogue: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  playerDialogue: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },

  // Narrator / system
  narrator: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },

  // UI elements
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 0.5,
  },
} as const;
