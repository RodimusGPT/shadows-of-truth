import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../src/context/game-store';
import { useChatStore } from '../src/context/chat-store';
import { api } from '../src/services/api';
import { storage } from '../src/services/storage';
import { colors, typography, spacing, radius } from '../src/theme';

export default function HomeScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewGame = async () => {
    setStarting(true);
    setError(null);
    try {
      const { gameId, state } = await api.newGame('missing-heiress');
      console.log('[NewGame] Created game:', gameId);
      useChatStore.getState().clearMessages();
      useGameStore.setState({ gameState: state, error: null });
      await storage.saveCurrentGameId(gameId);
      console.log('[NewGame] State set, navigating to /chat');
      router.push('/chat');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const handleContinue = () => {
    router.push('/chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.titleSmall}>A NOIR MYSTERY</Text>
        <Text style={styles.title}>SHADOWS</Text>
        <Text style={styles.titleOf}>of</Text>
        <Text style={styles.title}>TRUTH</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.tagline}>
        Los Angeles, 1947. The city of angels has a devil's secret.
      </Text>

      <View style={styles.actions}>
        {gameState && (
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>CONTINUE CASE</Text>
            <Text style={styles.buttonSub}>Turn {gameState.turn}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleNewGame}
          disabled={starting}
        >
          <Text style={styles.buttonText}>
            {starting ? 'OPENING FILE...' : 'NEW CASE'}
          </Text>
          <Text style={styles.buttonSub}>The Missing Heiress</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Text style={styles.footer}>
        Every suspect lies. Every clue connects. Trust no one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  titleBlock: {
    alignItems: 'center',
  },
  titleSmall: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    letterSpacing: 4,
  },
  title: {
    ...typography.title,
    color: colors.text.accent,
    fontSize: 48,
    letterSpacing: 8,
  },
  titleOf: {
    ...typography.narrator,
    color: colors.text.muted,
    fontSize: 18,
    marginVertical: -4,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.accent.gold,
    marginVertical: spacing.lg,
  },
  tagline: {
    ...typography.narrator,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonSecondary: {
    borderColor: colors.border.visible,
  },
  buttonText: {
    ...typography.label,
    color: colors.text.accent,
    letterSpacing: 3,
  },
  buttonSub: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.accent.red,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  footer: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
