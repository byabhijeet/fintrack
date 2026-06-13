import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PersonalCreditParty = {
  id: string;
  user_id: string;
  friend_id: string | null;
  name: string;
  mobile: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
};

export type PersonalCreditTransaction = {
  id: string;
  creator_id: string;
  party_id: string | null;
  counterparty_mob: string;
  txn_date: string;
  type: 'gave' | 'got';
  amount: number;
  note: string | null;
  settled: boolean;
  settled_at: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute net balance from a list of transactions.
 *  Positive = you are owed money (receivable / got > gave)
 *  Negative = you owe money (payable / gave > got)
 */
export function computeNetBalance(txns: PersonalCreditTransaction[]): number {
  return txns.reduce((acc, t) => {
    if (t.type === 'got') return acc + t.amount;
    if (t.type === 'gave') return acc - t.amount;
    return acc;
  }, 0);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all credit parties for the authenticated user. */
export const useCreditParties = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['credit_parties', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('personal_credit_parties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as PersonalCreditParty[];
    },
    enabled: !!user,
  });
};

/** Fetch all non-settled transactions for a specific party. */
export const usePartyTransactions = (partyId: string) => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['credit_transactions', partyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('personal_credit_transactions')
        .select('*')
        .eq('party_id', partyId)
        .order('txn_date', { ascending: false });

      if (error) throw error;
      return data as PersonalCreditTransaction[];
    },
    enabled: !!user && !!partyId,
  });
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type AddPartyInput = {
  name: string;
  mobile: string;
  notes?: string;
};

/**
 * Add a new credit party.
 * Returns `{ party, isExisting }` — if a conflict occurs on (user_id, mobile),
 * the existing party is fetched and `isExisting` is set to `true`.
 */
export const useAddPartyMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (
      input: AddPartyInput
    ): Promise<{ party: PersonalCreditParty; isExisting: boolean }> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('personal_credit_parties')
        .insert([
          {
            user_id: user.id,
            name: input.name,
            mobile: input.mobile,
            notes: input.notes ?? null,
          },
        ])
        .select()
        .single();

      if (error) {
        // Postgres unique-violation code
        if (error.code === '23505') {
          // Fetch the existing party
          const { data: existing, error: fetchErr } = await supabase
            .from('personal_credit_parties')
            .select('*')
            .eq('user_id', user.id)
            .eq('mobile', input.mobile)
            .single();

          if (fetchErr) throw fetchErr;
          return { party: existing as PersonalCreditParty, isExisting: true };
        }
        throw error;
      }

      return { party: data as PersonalCreditParty, isExisting: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_parties'] });
    },
  });
};

export type AddTransactionInput = {
  party_id: string;
  counterparty_mob: string;
  type: 'gave' | 'got';
  amount: number;
  txn_date: string;
  note?: string;
};

/** Add a gave / got transaction linked to a party. */
export const useAddTransactionMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: AddTransactionInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('personal_credit_transactions')
        .insert([
          {
            creator_id: user.id,
            party_id: input.party_id,
            counterparty_mob: input.counterparty_mob,
            type: input.type,
            amount: input.amount,
            txn_date: input.txn_date,
            note: input.note ?? null,
            settled: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as PersonalCreditTransaction;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credit_transactions', variables.party_id] });
      // Invalidate party list so net balances update
      queryClient.invalidateQueries({ queryKey: ['credit_parties'] });
    },
  });
};

/** Delete (hard delete) a single transaction. */
export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, partyId }: { id: string; partyId: string }) => {
      const { error } = await supabase
        .from('personal_credit_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return partyId;
    },
    onSuccess: (partyId) => {
      queryClient.invalidateQueries({ queryKey: ['credit_transactions', partyId] });
      queryClient.invalidateQueries({ queryKey: ['credit_parties'] });
    },
  });
};
