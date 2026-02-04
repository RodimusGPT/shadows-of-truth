import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../theme';

interface ClueToastProps {
  clueName: string;
  onDismiss: () => void;
}

/**
 * Animated toast that appears when a new clue is discovered.
 * Slides in from the top, holds, then fades out.
 */
export function ClueToast({ clueName, onDismiss }: ClueToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSequence(
      withTiming(0, { duration: 400 }),
      withDelay(2500, withTiming(-100, { duration: 400 }))
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(2500, withTiming(0, { duration: 400 }, () => {
        runOnJS(onDismiss)();
      }))
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.label}>NEW CLUE</Text>
      <Text style={styles.name}>{clueName}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.accent.gold,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
});
