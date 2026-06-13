// src/services/biometrics.native.ts
// Native biometric authentication using expo-local-authentication.
// Metro picks this file on iOS and Android.
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Returns true if the device has biometric hardware AND enrolled credentials.
 */
export const checkAvailable = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

/**
 * Prompts the user for biometric authentication.
 */
export const authenticate = async (
  promptMessage: string = 'Authenticate to continue'
): Promise<BiometricResult> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
};
