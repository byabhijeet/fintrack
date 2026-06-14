import { useAuthStore } from '../authStore';
import { supabase } from '../../lib/supabase';
import * as SecureStore from 'expo-secure-store';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signInWithOtp: jest.fn(),
      signInWithPassword: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('authStore Biometric Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ biometricEnabled: false, biometricSetupComplete: false, isUnlocked: false });
  });

  it('enables biometrics correctly', async () => {
    await useAuthStore.getState().enableBiometric();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_setup_complete', 'true');
    expect(useAuthStore.getState().biometricEnabled).toBe(true);
    expect(useAuthStore.getState().biometricSetupComplete).toBe(true);
  });

  it('disables biometrics correctly', async () => {
    useAuthStore.setState({ biometricEnabled: true, isUnlocked: false });

    await useAuthStore.getState().disableBiometric();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'false');
    expect(useAuthStore.getState().biometricEnabled).toBe(false);
    expect(useAuthStore.getState().isUnlocked).toBe(true);
  });

  it('skips biometric setup correctly', async () => {
    await useAuthStore.getState().skipBiometricSetup();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'false');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_setup_complete', 'true');
    expect(useAuthStore.getState().biometricEnabled).toBe(false);
    expect(useAuthStore.getState().biometricSetupComplete).toBe(true);
    expect(useAuthStore.getState().isUnlocked).toBe(true);
  });
});
