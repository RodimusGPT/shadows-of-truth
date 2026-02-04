import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Vignette effect — darkens the edges of the screen for cinematic framing.
 * Uses radial-approximated linear gradients from each edge.
 */
export function VignetteOverlay() {
  return (
    <View style={styles.container}>
      {/* Top vignette */}
      <LinearGradient
        colors={['rgba(10,10,15,0.8)', 'transparent']}
        style={styles.top}
      />
      {/* Bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.8)']}
        style={styles.bottom}
      />
      {/* Left vignette */}
      <LinearGradient
        colors={['rgba(10,10,15,0.4)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.left}
      />
      {/* Right vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.4)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.right}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
    pointerEvents: 'none',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 40,
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 40,
  },
});
