import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '../../theme';

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
export function SceneImage({
  base64,
  mimeType = 'image/png',
  isLoading = false,
  aspectRatio = 'landscape',
  overlayOpacity = 0.3,
}: SceneImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (base64) {
      setImageLoaded(false);
    }
  }, [base64]);

  const aspectStyles = {
    portrait: { aspectRatio: 9 / 16 },
    landscape: { aspectRatio: 16 / 9 },
    square: { aspectRatio: 1 },
  };

  const uri = base64 ? `data:${mimeType};base64,${base64}` : undefined;

  return (
    <View style={[styles.container, aspectStyles[aspectRatio]]}>
      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
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
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Vignette overlay for noir effect */}
      <View style={[styles.vignette, { opacity: overlayOpacity }]} />

      {/* Top fade for text readability */}
      <View style={styles.topGradient} />
    </View>
  );
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
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
