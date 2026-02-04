import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { InventoryDrawer } from '../src/components/inventory/InventoryDrawer';
import { colors } from '../src/theme';

export default function NotebookScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'NOTEBOOK' }} />
      <InventoryDrawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
