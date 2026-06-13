import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  hasValidSubscription: boolean;
  isCheckingSubscription: boolean;
  biometricEnabled: boolean;
  biometricSetupComplete: boolean;
  isUnlocked: boolean;
  setSession: (session: Session | null) => void;
  signIn: (phone: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  init: () => void;
  checkSubscription: (userId: string) => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  skipBiometricSetup: () => Promise<void>;
  unlockApp: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  hasValidSubscription: false,
  isCheckingSubscription: true,
  biometricEnabled: false,
  biometricSetupComplete: false,
  isUnlocked: false,

  setSession: (session) => {
    set({ session, user: session?.user || null });
    if (session?.user) {
      set({ isCheckingSubscription: true });
      get().checkSubscription(session.user.id);
    } else {
      set({ isCheckingSubscription: false });
    }
  },

  checkSubscription: async (userId: string) => {
    try {
      // Check 1: Personal User Plan
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select(`
          plan_status,
          plans ( level, name )
        `)
        .eq('auth_id', userId)
        .single();

      if (!accountError && accountData) {
        const { plan_status, plans } = accountData as any;
        if ((plan_status === 'active' || plan_status === 'trialing') && plans) {
          if (plans.level >= 1 || plans.name.toLowerCase().includes('premium') || plans.name.toLowerCase().includes('level')) {
            set({ hasValidSubscription: true, isCheckingSubscription: false });
            return true;
          }
        }
      }

      // Check 2: Merchant User Plan
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!orgError && orgMembers && orgMembers.length > 0) {
        for (const member of orgMembers) {
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select(`
              status,
              plans ( level, name )
            `)
            .eq('organization_id', member.organization_id)
            .in('status', ['active', 'trialing']);

          if (!subError && subData && subData.length > 0) {
            for (const sub of subData as any[]) {
              if (sub.plans && (sub.plans.level >= 1 || sub.plans.name.toLowerCase().includes('premium') || sub.plans.name.toLowerCase().includes('level'))) {
                set({ hasValidSubscription: true, isCheckingSubscription: false });
                return true;
              }
            }
          }
        }
      }

      set({ hasValidSubscription: false, isCheckingSubscription: false });
      return false;
    } catch (error) {
      console.error('Subscription check error:', error);
      set({ hasValidSubscription: false, isCheckingSubscription: false });
      return false;
    }
  },

  signIn: async (phone) => {
    return await supabase.auth.signInWithOtp({ phone });
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
    set({ session: null, user: null, profile: null, hasValidSubscription: false });
  },

  enableBiometric: async () => {
    await SecureStore.setItemAsync('biometric_enabled', 'true');
    await SecureStore.setItemAsync('biometric_setup_complete', 'true');
    set({ biometricEnabled: true, biometricSetupComplete: true });
  },

  skipBiometricSetup: async () => {
    await SecureStore.setItemAsync('biometric_enabled', 'false');
    await SecureStore.setItemAsync('biometric_setup_complete', 'true');
    set({ biometricEnabled: false, biometricSetupComplete: true, isUnlocked: true });
  },

  unlockApp: () => set({ isUnlocked: true }),

  init: async () => {
    // Load biometric preference
    const bioEnabled = await SecureStore.getItemAsync('biometric_enabled');
    const bioSetup = await SecureStore.getItemAsync('biometric_setup_complete');
    
    set({ 
      biometricEnabled: bioEnabled === 'true',
      biometricSetupComplete: bioSetup === 'true',
      isUnlocked: bioEnabled !== 'true' // If not enabled, it's unlocked by default
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });
  },
}));
