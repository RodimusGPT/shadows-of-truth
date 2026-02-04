import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../context/game-store';
import { ClueCard } from './ClueCard';
import { NpcTrustMeter } from './NpcTrustMeter';
import { colors, typography, spacing, radius } from '../../theme';

type Tab = 'clues' | 'npcs';

export function InventoryDrawer() {
  const [tab, setTab] = useState<Tab>('clues');
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const discoveredClues = gameState.clues.filter((c) => c.discovered);
  const metNpcs = gameState.npcs.filter((n) => n.introduced);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTEBOOK</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'clues' && styles.tabActive]}
          onPress={() => setTab('clues')}
        >
          <Text style={[styles.tabText, tab === 'clues' && styles.tabTextActive]}>
            Clues ({discoveredClues.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'npcs' && styles.tabActive]}
          onPress={() => setTab('npcs')}
        >
          <Text style={[styles.tabText, tab === 'npcs' && styles.tabTextActive]}>
            Contacts ({metNpcs.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'clues' &&
          (discoveredClues.length > 0 ? (
            discoveredClues.map((clue) => <ClueCard key={clue.id} clue={clue} />)
          ) : (
            <Text style={styles.emptyText}>No clues discovered yet. Start investigating.</Text>
          ))}

        {tab === 'npcs' &&
          (metNpcs.length > 0 ? (
            metNpcs.map((npc) => <NpcTrustMeter key={npc.id} npc={npc} />)
          ) : (
            <Text style={styles.emptyText}>You haven't met anyone yet.</Text>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.accent.gold,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 20,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent.gold,
  },
  tabText: {
    ...typography.label,
    color: colors.text.muted,
  },
  tabTextActive: {
    color: colors.accent.gold,
  },
  content: {
    flex: 1,
  },
  emptyText: {
    ...typography.narrator,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
