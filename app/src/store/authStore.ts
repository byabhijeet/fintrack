import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
// Platform-agnostic storage: Metro resolves storage.native.ts on mobile,
// storage.web.ts on web. No Platform.OS checks needed here.
import { setItem, getItem } from '../services/storage';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  biometricEnabled: boolean;
  biometricSetupComplete: boolean;
  isUnlocked: boolean;
  setSession: (session: Session | null) => void;
  signIn: (phone: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  init: () => void;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  skipBiometricSetup: () => Promise<void>;
  unlockApp: () => void;
  signUp: (phone: string, fullName: string, email: string) => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  biometricEnabled: false,
  biometricSetupComplete: false,
  isUnlocked: false,

  setSession: (session) => {
    set({ session, user: session?.user || null });
  },

  signIn: async (phone) => {
    return await supabase.auth.signInWithOtp({ phone });
  },

  signUp: async (phone, fullName, email) => {
    return await supabase.auth.signInWithOtp({ 
      phone,
      options: {
        data: {
          full_name: fullName,
          email,
        }
      }
    });
  },

  signInWithPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) {
      get().setSession(data.session);
    }
    return { error };
  },

  verifyOtp: async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (data.session) {
      get().setSession(data.session);
    }
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  enableBiometric: async () => {
    await setItem('biometric_enabled', 'true');
    await setItem('biometric_setup_complete', 'true');
    set({ biometricEnabled: true, biometricSetupComplete: true });
  },

  disableBiometric: async () => {
    await setItem('biometric_enabled', 'false');
    set({ biometricEnabled: false, isUnlocked: true });
  },

  skipBiometricSetup: async () => {
    await setItem('biometric_enabled', 'false');
    await setItem('biometric_setup_complete', 'true');
    set({ biometricEnabled: false, biometricSetupComplete: true, isUnlocked: true });
  },

  unlockApp: () => set({ isUnlocked: true }),

  init: async () => {
    // Load biometric preference from platform-agnostic storage.
    // On native: reads from SecureStore. On web: reads from localStorage.
    const isWeb = Platform.OS === 'web';
    const bioEnabled = isWeb ? 'false' : await getItem('biometric_enabled');
    const bioSetup = isWeb ? 'true' : await getItem('biometric_setup_complete');

    set({
      biometricEnabled: !isWeb && bioEnabled === 'true',
      biometricSetupComplete: isWeb ? true : bioSetup === 'true',
      isUnlocked: isWeb ? true : bioEnabled !== 'true', // if biometrics not enabled, app is unlocked by default
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });
  },
}));
