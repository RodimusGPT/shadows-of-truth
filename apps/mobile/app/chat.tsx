import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { ChatMessage } from '@shadows/shared';
import { ChatBubble } from '../src/components/chat/ChatBubble';
import { ChatInput } from '../src/components/chat/ChatInput';
import { TypingIndicator } from '../src/components/chat/TypingIndicator';
import { SceneImage } from '../src/components/atmosphere/SceneImage';
import { useChat } from '../src/hooks/useChat';
import { useGameStore } from '../src/context/game-store';
import { useNpcPortrait, useLocationImage } from '../src/hooks/useSceneImage';
import { storage } from '../src/services/storage';
import { colors, typography, spacing } from '../src/theme';

export default function ChatScreen() {
  const { messages, isSending, send, currentNpc } = useChat();
  const gameState = useGameStore((s) => s.gameState);
  const isLoading = useGameStore((s) => s.isLoading);
  const error = useGameStore((s) => s.error);
  const loadGame = useGameStore((s) => s.loadGame);
  const currentLocation = gameState?.locations.find(
    (l) => l.id === gameState.currentLocationId
  ) ?? null;
  const flatListRef = useRef<FlatList>(null);

  // Fetch scene images
  const npcImage = useNpcPortrait(gameState?.gameId, currentNpc?.id);
  const locationImage = useLocationImage(gameState?.gameId, currentLocation?.id);

  // Show NPC portrait if talking to someone, otherwise show location
  const sceneImage = currentNpc ? npcImage : locationImage;

  // Fallback: if state was lost (e.g. full page reload), restore from storage
  useEffect(() => {
    if (!gameState && !isLoading) {
      storage.getCurrentGameId().then((id) => {
        if (id && !useGameStore.getState().gameState) {
          loadGame(id);
        }
      });
    }
  }, [gameState, isLoading, loadGame]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Investigation' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isLoading
              ? 'Opening case file...'
              : error ?? 'No active case. Return to the main menu to start one.'}
          </Text>
        </View>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble
      message={item}
      npcName={item.npcId ? currentNpc?.name : undefined}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: currentLocation?.name ?? 'Investigation',
          headerRight: () => (
            <Text style={styles.turnBadge}>
              Turn {messages.length > 0 ? messages[messages.length - 1].turn : 0}
            </Text>
          ),
        }}
      />

      {/* Scene Image */}
      <View style={styles.sceneImageContainer}>
        <SceneImage
          base64={sceneImage.base64 ?? undefined}
          mimeType={sceneImage.mimeType}
          isLoading={sceneImage.isLoading}
          aspectRatio="landscape"
        />
      </View>

      {currentNpc && (
        <View style={styles.npcBanner}>
          <Text style={styles.npcBannerText}>
            Speaking with {currentNpc.name}
          </Text>
          <Text style={styles.npcBannerMood}>{currentNpc.mood}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {currentLocation?.atmosphere ?? 'The investigation begins.'}
            </Text>
            {currentNpc && (
              <Text style={styles.emptyPrompt}>
                {currentNpc.name} is here. What do you say?
              </Text>
            )}
          </View>
        }
      />

      {isSending && <TypingIndicator />}

      <ChatInput
        onSend={send}
        disabled={isSending}
        placeholder={currentNpc ? `Talk to ${currentNpc.name}...` : 'Investigate...'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  sceneImageContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  npcBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  npcBannerText: {
    ...typography.bodySmall,
    color: colors.npc.name,
    fontWeight: '600',
  },
  npcBannerMood: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  turnBadge: {
    ...typography.caption,
    color: colors.text.muted,
    marginRight: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...typography.narrator,
    color: colors.narrator.text,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyPrompt: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
