import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Reward = {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  partner_name?: string;
  logo_url?: string;
  is_active: boolean;
  promo_code?: string;
  store_type: 'online' | 'offline';
  store_location?: string;
  created_at: string;
};

export type Redemption = {
  id: string;
  user_id: string;
  reward_title: string;
  points_spent: number;
  redemption_code?: string;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
};

export type FlashDeal = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  deal_url?: string;
  button_text: string;
  discount_percentage?: number;
  expires_at?: string;
  is_active: boolean;
  app_target: string;
  created_at: string;
};

export type PartnerReferral = {
  id: string;
  referrer_id?: string;
  referrer_email?: string;
  referrer_phone?: string;
  referred_id?: string;
  referred_email: string;
  referred_phone?: string;
  status: 'pending' | 'accepted' | 'completed';
  referral_url?: string;
  created_at: string;
};

export type UserRewards = {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  rewards_earned: number;
  rewards_redeemed: number;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch active rewards/offers */
export const useRewards = () => {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Reward[];
    },
  });
};

/** Fetch flash deals */
export const useFlashDeals = () => {
  return useQuery({
    queryKey: ['flash_deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_deals')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FlashDeal[];
    },
  });
};

/** Fetch user redemptions */
export const useUserRedemptions = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['redemptions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Redemption[];
    },
    enabled: !!user,
  });
};

/** Fetch user reward points (custom RPC or calculated from redemptions) */
export const useUserPoints = () => {
  const user = useAuthStore((s) => s.user);
  const { data: redemptions } = useUserRedemptions();

  const points = React.useMemo(() => {
    if (!user) return { total: 0, lifetime: 0, earned: 0, redeemed: 0 };

    // Calculate from redemptions: each 100 INR spent = 1 point
    // For demo, assume 1 point per transaction
    const redeemed = (redemptions || []).reduce((sum, r) => sum + r.points_spent, 0);
    const lifetime = redeemed + 500; // Demo: give 500 bonus points

    return {
      total: lifetime - redeemed,
      lifetime,
      earned: 500,
      redeemed,
    };
  }, [user, redemptions]);

  return points;
};

/** Fetch partner referrals */
export const usePartnerReferrals = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['partner_referrals', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('partner_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PartnerReferral[];
    },
    enabled: !!user,
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type RedeemRewardInput = {
  reward_id: string;
  reward_title: string;
  points_spent: number;
};

export const useRedeemRewardMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: RedeemRewardInput): Promise<Redemption> => {
      if (!user) throw new Error('Not authenticated');

      // Generate a redemption code
      const redemptionCode = `REDEM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const { data, error } = await supabase
        .from('redemptions')
        .insert([
          {
            user_id: user.id,
            reward_title: input.reward_title,
            points_spent: input.points_spent,
            redemption_code: redemptionCode,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Redemption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
    },
  });
};

export type CreateReferralInput = {
  referred_email: string;
  referred_phone?: string;
};

export const useCreateReferralMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: CreateReferralInput): Promise<PartnerReferral> => {
      if (!user) throw new Error('Not authenticated');

      const referralUrl = `https://fintrack.app/join?ref=${user.id}`;

      const { data, error } = await supabase
        .from('partner_referrals')
        .insert([
          {
            referrer_id: user.id,
            referrer_email: user.email,
            referred_email: input.referred_email,
            referred_phone: input.referred_phone,
            referral_url: referralUrl,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as PartnerReferral;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_referrals'] });
    },
  });
};
