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

describe('authStore Subscription Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ hasValidSubscription: false, isCheckingSubscription: false });
  });

  it('validates a personal plan successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          plan_status: 'active',
          plans: { level: 1, name: 'Basic' },
        },
        error: null,
      }),
    });

    const result = await useAuthStore.getState().checkSubscription('user-1');
    expect(result).toBe(true);
    expect(useAuthStore.getState().hasValidSubscription).toBe(true);
  });

  it('validates a merchant plan successfully if personal fails', async () => {
    // Mock the personal query to return nothing
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'accounts') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        };
      }
      if (table === 'organization_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          // Active org member
          resolvedValue: [{ organization_id: 'org-1' }],
          then(resolve: any) { resolve({ data: [{ organization_id: 'org-1' }], error: null }); },
        };
      }
      if (table === 'subscriptions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              { status: 'active', plans: { level: 2, name: 'Premium' } }
            ],
            error: null
          }),
        };
      }
      return {};
    });

    const result = await useAuthStore.getState().checkSubscription('user-2');
    expect(result).toBe(true);
    expect(useAuthStore.getState().hasValidSubscription).toBe(true);
  });

  it('fails validation when no active plans are found', async () => {
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'accounts') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        };
      }
      if (table === 'organization_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          resolvedValue: [],
          then(resolve: any) { resolve({ data: [], error: null }); },
        };
      }
      return {};
    });

    const result = await useAuthStore.getState().checkSubscription('user-3');
    expect(result).toBe(false);
    expect(useAuthStore.getState().hasValidSubscription).toBe(false);
  });
});

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
