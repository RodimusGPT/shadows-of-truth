import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clue } from '@shadows/shared';
import { colors, typography, spacing, radius } from '../../theme';

interface ClueCardProps {
  clue: Clue;
}

export function ClueCard({ clue }: ClueCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{clue.name}</Text>
        <View style={styles.tagRow}>
          {clue.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.description}>{clue.description}</Text>
      {clue.discoveredAtTurn !== undefined && (
        <Text style={styles.meta}>Discovered on turn {clue.discoveredAtTurn}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.text.accent,
    flex: 1,
    fontSize: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.bg.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});
