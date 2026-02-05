import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../src/context/game-store';
import { useChatStore } from '../src/context/chat-store';
import { api, CaseInfo } from '../src/services/api';
import { storage } from '../src/services/storage';
import { colors, typography, spacing, radius } from '../src/theme';

export default function HomeScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [startingCase, setStartingCase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listCases()
      .then((res) => setCases(res.cases))
      .catch(() => setError('Failed to load cases'))
      .finally(() => setLoadingCases(false));
  }, []);

  const handleNewGame = async (caseId: string) => {
    setStartingCase(caseId);
    setError(null);
    try {
      const { gameId, state } = await api.newGame(caseId);
      useChatStore.getState().clearMessages();
      useGameStore.setState({ gameState: state, error: null });
      await storage.saveCurrentGameId(gameId);
      router.push('/chat');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStartingCase(null);
    }
  };

  const handleContinue = () => {
    router.push('/chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleSmall}>MYSTERY ANTHOLOGY</Text>
        <Text style={styles.title}>SHADOWS</Text>
        <Text style={styles.titleOf}>of</Text>
        <Text style={styles.title}>TRUTH</Text>
      </View>

      <View style={styles.divider} />

      {gameState && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>CONTINUE: {gameState.caseId.toUpperCase()}</Text>
          <Text style={styles.continueSub}>Turn {gameState.turn}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>SELECT A CASE</Text>

      {loadingCases ? (
        <ActivityIndicator color={colors.accent.gold} style={styles.loader} />
      ) : (
        <ScrollView
          style={styles.caseList}
          contentContainerStyle={styles.caseListContent}
          showsVerticalScrollIndicator={false}
        >
          {cases.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.caseCard}
              onPress={() => handleNewGame(c.id)}
              disabled={startingCase !== null}
            >
              <Text style={styles.caseTitle}>{c.title}</Text>
              <Text style={styles.caseSetting}>{c.setting}</Text>
              <Text style={styles.caseSynopsis} numberOfLines={3}>
                {c.synopsis}
              </Text>
              {startingCase === c.id && (
                <View style={styles.caseLoading}>
                  <ActivityIndicator color={colors.accent.gold} size="small" />
                  <Text style={styles.caseLoadingText}>Opening case file...</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

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
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  titleSmall: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    letterSpacing: 3,
    fontSize: 11,
  },
  title: {
    ...typography.title,
    color: colors.text.accent,
    fontSize: 36,
    letterSpacing: 6,
  },
  titleOf: {
    ...typography.narrator,
    color: colors.text.muted,
    fontSize: 16,
    marginVertical: -2,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.accent.gold,
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.accent.gold,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  continueText: {
    ...typography.label,
    color: colors.bg.primary,
    letterSpacing: 2,
  },
  continueSub: {
    ...typography.caption,
    color: colors.bg.secondary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.muted,
    letterSpacing: 2,
    fontSize: 10,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  caseList: {
    flex: 1,
  },
  caseListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.xl,
    gap: spacing.md,
  },
  caseCard: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  caseTitle: {
    ...typography.body,
    color: colors.text.accent,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  caseSetting: {
    ...typography.caption,
    color: colors.accent.gold,
    marginBottom: spacing.sm,
  },
  caseSynopsis: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  caseLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  caseLoadingText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.accent.red,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  footer: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
});
