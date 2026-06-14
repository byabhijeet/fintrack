import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type AccountConsents = {
  account_id: string;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  whatsapp_opt_in: boolean;
  marketing_consent: boolean;
  data_processing_consent: boolean;
};

export const useAccountConsents = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['account_consents', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (accError) throw accError;

      const { data, error } = await supabase
        .from('account_consents')
        .select('*')
        .eq('account_id', account.id)
        .maybeSingle();

      if (error) throw error;

      // If none found, return defaults
      return data as AccountConsents || {
        account_id: account.id,
        sms_opt_in: false,
        email_opt_in: false,
        whatsapp_opt_in: false,
        marketing_consent: false,
        data_processing_consent: false,
      };
    },
    enabled: !!user,
  });
};

export type UpdateConsentsInput = Partial<Omit<AccountConsents, 'account_id'>>;

export const useUpdateConsentsMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: UpdateConsentsInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (accError) throw accError;

      const { data: existing, error: checkError } = await supabase
        .from('account_consents')
        .select('account_id')
        .eq('account_id', account.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { data, error } = await supabase
          .from('account_consents')
          .update(input)
          .eq('account_id', account.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('account_consents')
          .insert([{ account_id: account.id, ...input }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account_consents', user?.id] });
    },
  });
};
