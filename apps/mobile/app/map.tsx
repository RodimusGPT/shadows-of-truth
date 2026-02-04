import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useGameStore } from '../src/context/game-store';
import { colors, typography, spacing, radius } from '../src/theme';

export default function MapScreen() {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const currentLocation = gameState.locations.find(
    (l) => l.id === gameState.currentLocationId
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'MAP' }} />

      <Text style={styles.currentLabel}>CURRENT LOCATION</Text>
      {currentLocation && (
        <View style={styles.currentCard}>
          <Text style={styles.locationName}>{currentLocation.name}</Text>
          <Text style={styles.locationDesc}>{currentLocation.description}</Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>KNOWN LOCATIONS</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {gameState.locations
          .filter((l) => l.visited || l.connectedLocationIds.includes(gameState.currentLocationId))
          .map((location) => {
            const isCurrent = location.id === gameState.currentLocationId;
            const npcsHere = gameState.npcs.filter(
              (n) => n.locationId === location.id
            );

            return (
              <TouchableOpacity
                key={location.id}
                style={[styles.locationCard, isCurrent && styles.locationCurrent]}
                disabled={isCurrent}
              >
                <View style={styles.locationHeader}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  {isCurrent && <Text style={styles.hereBadge}>HERE</Text>}
                </View>
                <Text style={styles.locationAtmo}>{location.atmosphere}</Text>
                {npcsHere.length > 0 && (
                  <Text style={styles.npcsPresent}>
                    Present: {npcsHere.map((n) => n.name).join(', ')}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  currentLabel: {
    ...typography.label,
    color: colors.accent.gold,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  currentCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.gold,
  },
  locationCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  locationCurrent: {
    borderColor: colors.accent.gold,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontSize: 15,
  },
  hereBadge: {
    ...typography.label,
    color: colors.accent.gold,
    fontSize: 10,
  },
  locationDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  locationAtmo: {
    ...typography.caption,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  npcsPresent: {
    ...typography.caption,
    color: colors.npc.name,
    marginTop: spacing.sm,
  },
});
