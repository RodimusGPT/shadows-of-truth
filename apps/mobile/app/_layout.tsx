import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.primary },
          headerTintColor: colors.text.accent,
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing: 1,
          },
          contentStyle: { backgroundColor: colors.bg.primary },
          animation: 'fade',
        }}
      />
    </>
  );
}
