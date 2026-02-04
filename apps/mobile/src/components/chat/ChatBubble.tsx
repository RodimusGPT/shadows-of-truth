import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@shadows/shared';
import { colors, typography, spacing, radius } from '../../theme';

interface ChatBubbleProps {
  message: ChatMessage;
  npcName?: string;
}

export function ChatBubble({ message, npcName }: ChatBubbleProps) {
  const isPlayer = message.role === 'player';
  const isNarrator = message.role === 'narrator' || message.role === 'system';

  if (isNarrator) {
    return (
      <View style={styles.narratorContainer}>
        <Text style={styles.narratorText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isPlayer ? styles.playerAlign : styles.npcAlign]}>
      {!isPlayer && npcName && (
        <Text style={styles.npcName}>{npcName}</Text>
      )}
      <View style={[styles.bubble, isPlayer ? styles.playerBubble : styles.npcBubble]}>
        <Text style={isPlayer ? styles.playerText : styles.npcText}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    maxWidth: '85%',
  },
  playerAlign: {
    alignSelf: 'flex-end',
  },
  npcAlign: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  playerBubble: {
    backgroundColor: colors.bg.elevated,
    borderBottomRightRadius: radius.sm,
  },
  npcBubble: {
    backgroundColor: colors.bg.card,
    borderBottomLeftRadius: radius.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent.gold,
  },
  playerText: {
    ...typography.playerDialogue,
    color: colors.player.dialogue,
  },
  npcText: {
    ...typography.npcDialogue,
    color: colors.npc.dialogue,
  },
  npcName: {
    ...typography.label,
    color: colors.npc.name,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  narratorContainer: {
    alignSelf: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  narratorText: {
    ...typography.narrator,
    color: colors.narrator.text,
    textAlign: 'center',
  },
});
