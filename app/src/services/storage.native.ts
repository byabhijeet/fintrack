// src/services/storage.native.ts
// Native implementation: uses expo-secure-store for encrypted key-value storage.
// Metro picks this file on iOS and Android.
import * as SecureStore from 'expo-secure-store';

export const setItem = (key: string, value: string): Promise<void> =>
  SecureStore.setItemAsync(key, value);

export const getItem = (key: string): Promise<string | null> =>
  SecureStore.getItemAsync(key);

export const deleteItem = (key: string): Promise<void> =>
  SecureStore.deleteItemAsync(key);
