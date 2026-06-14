import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type AccountProfile = {
  id: string;
  full_name: string | null;
  upi_id: string | null;
  avatar_url: string | null;
  billzest_id: string | null;
};

export type Address = {
  id: string;
  account_id: string;
  label: string;
  line1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

export const useProfile = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error) throw error;
      return data as AccountProfile;
    },
    enabled: !!user,
  });
};

export const useAddress = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['address', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Find the account id first
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (accError) throw accError;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('account_id', account.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Address | null;
    },
    enabled: !!user,
  });
};

export type UpdateProfileInput = {
  full_name?: string;
  upi_id?: string;
  avatar_url?: string;
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .update(input)
        .eq('auth_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

export type UpdateAddressInput = {
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: UpdateAddressInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (accError) throw accError;

      // Check if address exists
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('account_id', account.id)
        .maybeSingle();

      if (existingAddress) {
        const { data, error } = await supabase
          .from('addresses')
          .update(input)
          .eq('id', existingAddress.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('addresses')
          .insert([
            {
              account_id: account.id,
              ...input,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['address', user?.id] });
    },
  });
};
