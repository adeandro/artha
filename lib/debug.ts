/**
 * Debug utilities for AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("🔍 AsyncStorage Keys:", keys);

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📦 ${key}:`, value);
    }
  } catch (e) {
    console.error("❌ Error reading storage:", e);
  }
};

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("✅ Storage cleared");
  } catch (e) {
    console.error("❌ Error clearing storage:", e);
  }
};
