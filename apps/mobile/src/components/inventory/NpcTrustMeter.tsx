import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Npc } from '@shadows/shared';
import { colors, typography, spacing, radius } from '../../theme';

interface NpcTrustMeterProps {
  npc: Npc;
}

export function NpcTrustMeter({ npc }: NpcTrustMeterProps) {
  const trustPercent = npc.trustLevel;
  const trustColor =
    trustPercent >= 60
      ? colors.accent.green
      : trustPercent >= 30
        ? colors.accent.amber
        : colors.accent.red;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{npc.name}</Text>
        <Text style={[styles.mood, { color: colors.text.secondary }]}>{npc.mood}</Text>
      </View>
      <Text style={styles.role}>{npc.role}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${trustPercent}%`, backgroundColor: trustColor }]} />
      </View>
      <Text style={[styles.trustLabel, { color: trustColor }]}>
        Trust: {trustPercent}/100
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontSize: 16,
  },
  mood: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  role: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.bg.elevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  trustLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
