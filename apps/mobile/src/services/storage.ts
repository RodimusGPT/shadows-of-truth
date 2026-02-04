import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CURRENT_GAME: 'shadows:currentGame',
  SETTINGS: 'shadows:settings',
} as const;

export const storage = {
  async saveCurrentGameId(gameId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_GAME, gameId);
  },

  async getCurrentGameId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.CURRENT_GAME);
  },

  async clearCurrentGame(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CURRENT_GAME);
  },
};
