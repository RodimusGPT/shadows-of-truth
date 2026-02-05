import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';

/**
 * Film grain overlay using opacity-animated noise layers.
 * Runs at ~12fps visual update rate by using slow timing animations.
 *
 * For a true Skia shader implementation, replace this with:
 * @shopify/react-native-skia Canvas + RuntimeShader
 * This is a lightweight fallback that works without Skia.
 */
export function FilmGrainOverlay() {
  const opacity1 = useSharedValue(0.03);
  const opacity2 = useSharedValue(0.05);

  useEffect(() => {
    // ~12fps = 83ms per frame
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.06, { duration: 83, easing: Easing.linear }),
        withTiming(0.02, { duration: 83, easing: Easing.linear }),
        withTiming(0.05, { duration: 83, easing: Easing.linear }),
        withTiming(0.03, { duration: 83, easing: Easing.linear })
      ),
      -1,
      true
    );
    opacity2.value = withRepeat(
      withSequence(
        withTiming(0.04, { duration: 100, easing: Easing.linear }),
        withTiming(0.07, { duration: 100, easing: Easing.linear }),
        withTiming(0.02, { duration: 100, easing: Easing.linear })
      ),
      -1,
      true
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.grainLayer, style1]} />
      <Animated.View style={[styles.grainLayer2, style2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.text.primary,
  },
  grainLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.primary,
  },
});
