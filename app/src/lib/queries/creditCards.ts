import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type CreditCard = {
  id: string;
  user_id: string;
  card_name: string;
  bank: string;
  last4: string | null;
  credit_limit: number | null;
  billing_day: number | null;
  created_at: string;
};

export type CardSpend = {
  id: string;
  user_id: string;
  card_id: string | null;
  spend_date: string;
  merchant: string;
  category: string | null;
  amount: number;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
};

export const useCreditCards = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['credit_cards', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!user,
  });
};

export const useAddCreditCardMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newCard: Omit<CreditCard, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_cards')
        .insert([{
          ...newCard,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as CreditCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
    },
  });
};

export const useCardSpends = (cardId: string) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['card_spends', cardId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_spends')
        .select('*')
        .eq('card_id', cardId)
        .order('spend_date', { ascending: false });

      if (error) throw error;
      return data as CardSpend[];
    },
    enabled: !!user && !!cardId,
  });
};

export const useAddCardSpendMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newSpend: Omit<CardSpend, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_spends')
        .insert([{
          ...newSpend,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as CardSpend;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card_spends', variables.card_id] });
    },
  });
};
