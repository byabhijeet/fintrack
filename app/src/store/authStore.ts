import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  hasValidSubscription: boolean;
  biometricEnabled: boolean;
  setSession: (session: Session | null) => void;
  signIn: (phone: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  hasValidSubscription: true, // Temporary default for Slice 2, will implement gate in Slice 3
  biometricEnabled: false,
  setSession: (session) => set({ session, user: session?.user || null }),
  signIn: async (phone) => {
    return await supabase.auth.signInWithOtp({ phone });
  },
  signInWithPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) {
      set({ session: data.session, user: data.user });
    }
    return { error };
  },
  verifyOtp: async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (data.session) {
      set({ session: data.session, user: data.user });
    }
    return { error };
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user || null });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null });
    });
  },
}));
