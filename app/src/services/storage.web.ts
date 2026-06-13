// src/services/storage.web.ts
// Web implementation: uses localStorage (synchronous, wrapped in Promises for API parity).
// Metro picks this file on the web platform. No expo-secure-store import needed.

export const setItem = (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing or storage quota exceeded — fail silently
  }
  return Promise.resolve();
};

export const getItem = (key: string): Promise<string | null> => {
  try {
    return Promise.resolve(localStorage.getItem(key));
  } catch {
    return Promise.resolve(null);
  }
};

export const deleteItem = (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  return Promise.resolve();
};
