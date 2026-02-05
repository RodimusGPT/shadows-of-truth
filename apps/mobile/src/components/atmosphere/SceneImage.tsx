import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Pressable, Text } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

interface SceneImageProps {
  /** Base64 image data */
  base64?: string;
  /** MIME type of the image */
  mimeType?: string;
  /** Whether image is loading */
  isLoading?: boolean;
  /** Aspect ratio: 'portrait' | 'landscape' | 'square' */
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  /** Optional overlay darkness (0-1) */
  overlayOpacity?: number;
  /** Collapsible mode - starts small, tap to expand */
  collapsible?: boolean;
}

/**
 * SceneImage — Displays generated noir scene images with atmospheric effects.
 *
 * Features:
 * - Fade-in animation when image loads
 * - Loading indicator
 * - Vignette overlay for noir effect
 * - Configurable aspect ratios
 */
/** Collapsed thumbnail height */
const COLLAPSED_HEIGHT = 120;
/** Expanded height */
const EXPANDED_HEIGHT = 280;

export function SceneImage({
  base64,
  mimeType = 'image/png',
  isLoading = false,
  aspectRatio = 'landscape',
  overlayOpacity = 0.3,
  collapsible = false,
}: SceneImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  useEffect(() => {
    if (base64) {
      setImageLoaded(false);
    }
  }, [base64]);

  useEffect(() => {
    if (collapsible) {
      // Animate height change (0 = collapsed percentage, 1 = expanded)
      animatedHeight.value = withTiming(expanded ? 1 : 0, { duration: 300 });
    }
  }, [expanded, collapsible]);

  const aspectStyles = {
    portrait: { aspectRatio: 9 / 16 },
    landscape: { aspectRatio: 16 / 9 },
    square: { aspectRatio: 1 },
  };

  const uri = base64 ? `data:${mimeType};base64,${base64}` : undefined;

  const handlePress = () => {
    if (collapsible && base64) {
      setExpanded(!expanded);
    }
  };

  // For collapsible mode, we use fixed heights instead of aspect ratio
  const containerStyle = collapsible
    ? [styles.container, { height: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }]
    : [styles.container, aspectStyles[aspectRatio]];

  const content = (
    <View style={containerStyle}>
      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent.gold} />
          {collapsible && (
            <Text style={styles.loadingText}>Loading scene...</Text>
          )}
        </View>
      )}

      {/* Image */}
      {uri && !isLoading && (
        <Animated.View
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(400)}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={{ uri }}
            style={styles.image}
            onLoad={() => setImageLoaded(true)}
            resizeMode={collapsible && !expanded ? "contain" : "cover"}
          />
        </Animated.View>
      )}

      {/* Vignette overlay for noir effect */}
      <View style={[styles.vignette, { opacity: overlayOpacity }]} />

      {/* Expand/collapse indicator for collapsible mode */}
      {collapsible && base64 && !isLoading && (
        <View style={styles.expandIndicator}>
          <Text style={styles.expandText}>
            {expanded ? '▲ Tap to collapse' : '▼ Tap to expand'}
          </Text>
        </View>
      )}
    </View>
  );

  if (collapsible) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

/**
 * SceneImagePlaceholder — Shows when no image is available
 */
export function SceneImagePlaceholder({
  aspectRatio = 'landscape',
}: {
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}) {
  const aspectStyles = {
    portrait: { aspectRatio: 9 / 16 },
    landscape: { aspectRatio: 16 / 9 },
    square: { aspectRatio: 1 },
  };

  return (
    <View style={[styles.container, aspectStyles[aspectRatio], styles.placeholder]}>
      <View style={styles.placeholderInner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.bg.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pressable: {
    width: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // Radial gradient approximation using border
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
    // Linear gradient from top
    borderTopWidth: 60,
    borderTopColor: 'rgba(0,0,0,0.4)',
  },
  expandIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  expandText: {
    color: colors.text.muted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInner: {
    width: '60%',
    height: '40%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: 4,
    opacity: 0.5,
  },
});
