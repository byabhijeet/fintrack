// src/services/biometrics.web.ts
// Web stub: biometrics are not supported in a browser context.
// Metro picks this file on web, keeping expo-local-authentication out of the web bundle.

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/** Biometrics are always unavailable on web. */
export const checkAvailable = async (): Promise<boolean> => false;

/** No-op on web — always returns failure. */
export const authenticate = async (
  _promptMessage?: string
): Promise<BiometricResult> => ({ success: false, error: 'Not supported on web' });
