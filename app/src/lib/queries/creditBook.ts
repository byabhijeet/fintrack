import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

const PAGE_SIZE = 10;

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
  is_b2b?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute net balance from a list of transactions.
 *  Positive = you are owed money (receivable / gave > got)
 *  Negative = you owe money (payable / got > gave)
 */
export function computeNetBalance(txns: PersonalCreditTransaction[]): number {
  return txns.reduce((acc, t) => {
    if (t.type === 'gave') return acc + t.amount;
    if (t.type === 'got') return acc - t.amount;
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

/** Fetch credit parties with infinite scroll. */
export const useInfiniteCreditParties = () => {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: ['credit_parties_infinite', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('personal_credit_parties')
        .select('*')
        .order('name', { ascending: true })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      return data as PersonalCreditParty[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!user,
  });
};

/** Fetch all non-settled transactions for a specific party, including B2B sync. */
export const usePartyTransactions = (partyId: string, partyMobile?: string) => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['credit_transactions', partyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch P2P transactions
      const { data: p2pData, error: p2pError } = await supabase
        .from('personal_credit_transactions')
        .select('*')
        .eq('party_id', partyId);

      if (p2pError) throw p2pError;
      
      let allTxns: PersonalCreditTransaction[] = (p2pData || []).map(t => ({ ...t, is_b2b: false }));

      // 2. Fetch B2B transactions if mobile is provided
      if (partyMobile) {
        try {
          const cleanMobile = partyMobile.replace(/\D/g, '').slice(-10);
          if (cleanMobile.length === 10) {
            // Find if there are any orgs for this mobile
            const searchTerms = [cleanMobile, `+91${cleanMobile}`, partyMobile];
            const { data: matchedAccounts } = await supabase
              .from('accounts')
              .select('id')
              .in('mobile', searchTerms);

            if (matchedAccounts && matchedAccounts.length > 0) {
              const matchedAccIds = matchedAccounts.map(a => a.id);
              
              // Find organizations corresponding to these accounts
              const { data: orgs } = await supabase
                .from('organizations')
                .select('id')
                .in('account_id', matchedAccIds);
              
              if (orgs && orgs.length > 0) {
                const orgIds = orgs.map(o => o.id);
                
                // Get current user's account_id
                const { data: userAcc } = await supabase
                  .from('accounts')
                  .select('id')
                  .eq('auth_id', user.id)
                  .single();
                  
                if (userAcc) {
                  // Fetch B2B transactions
                  const { data: b2bTxns } = await supabase
                    .from('credit_transactions')
                    .select('*')
                    .in('organization_id', orgIds)
                    .eq('party_id', userAcc.id);
                    
                  if (b2bTxns && b2bTxns.length > 0) {
                    const mappedB2B: PersonalCreditTransaction[] = b2bTxns.map((t: any) => ({
                      id: t.id,
                      creator_id: t.organization_id, // Virtual creator
                      party_id: partyId,
                      counterparty_mob: partyMobile,
                      txn_date: t.date,
                      type: t.type === 'given' ? 'got' : 'gave',
                      amount: Number(t.amount),
                      note: t.description || 'Merchant Store Credit',
                      settled: false,
                      settled_at: null,
                      created_at: t.created_at,
                      is_b2b: true,
                    }));
                    allTxns = [...allTxns, ...mappedB2B];
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Failed to sync B2B transactions:', err);
        }
      }

      // Sort descending by date
      allTxns.sort((a, b) => new Date(b.txn_date).getTime() - new Date(a.txn_date).getTime());

      return allTxns;
    },
    enabled: !!user && !!partyId,
  });
};

/** Fetch party transactions with infinite scroll. */
export const useInfinitePartyTransactions = (partyId: string, partyMobile?: string) => {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: ['credit_transactions_infinite', partyId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch P2P transactions (paginated)
      const { data: p2pData, error: p2pError } = await supabase
        .from('personal_credit_transactions')
        .select('*')
        .eq('party_id', partyId)
        .order('txn_date', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (p2pError) throw p2pError;

      let allTxns: PersonalCreditTransaction[] = (p2pData || []).map(t => ({ ...t, is_b2b: false }));

      // 2. Fetch B2B transactions if mobile is provided
      // For simplicity in infinite scroll, we fetch all B2B transactions on the FIRST page only
      // because they are usually fewer and harder to paginate alongside P2P in memory.
      // Alternatively, we could fetch them separately, but for now we'll stick to this.
      if (partyMobile && pageParam === 0) {
        try {
          const cleanMobile = partyMobile.replace(/\D/g, '').slice(-10);
          if (cleanMobile.length === 10) {
            const searchTerms = [cleanMobile, `+91${cleanMobile}`, partyMobile];
            const { data: matchedAccounts } = await supabase
              .from('accounts')
              .select('id')
              .in('mobile', searchTerms);

            if (matchedAccounts && matchedAccounts.length > 0) {
              const matchedAccIds = matchedAccounts.map(a => a.id);
              const { data: orgs } = await supabase
                .from('organizations')
                .select('id')
                .in('account_id', matchedAccIds);

              if (orgs && orgs.length > 0) {
                const orgIds = orgs.map(o => o.id);
                const { data: userAcc } = await supabase
                  .from('accounts')
                  .select('id')
                  .eq('auth_id', user.id)
                  .single();

                if (userAcc) {
                  const { data: b2bTxns } = await supabase
                    .from('credit_transactions')
                    .select('*')
                    .in('organization_id', orgIds)
                    .eq('party_id', userAcc.id);

                  if (b2bTxns && b2bTxns.length > 0) {
                    const mappedB2B: PersonalCreditTransaction[] = b2bTxns.map((t: any) => ({
                      id: t.id,
                      creator_id: t.organization_id,
                      party_id: partyId,
                      counterparty_mob: partyMobile,
                      txn_date: t.date,
                      type: t.type === 'given' ? 'got' : 'gave',
                      amount: Number(t.amount),
                      note: t.description || 'Merchant Store Credit',
                      settled: false,
                      settled_at: null,
                      created_at: t.created_at,
                      is_b2b: true,
                    }));
                    allTxns = [...allTxns, ...mappedB2B];
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Failed to sync B2B transactions:', err);
        }
      }

      // Sort descending by date
      allTxns.sort((a, b) => new Date(b.txn_date).getTime() - new Date(a.txn_date).getTime());

      return allTxns;
    },
    getNextPageParam: (lastPage, allPages) => {
      // We only count P2P transactions for pagination
      const p2pCount = lastPage.filter(t => !t.is_b2b).length;
      return p2pCount === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
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
      queryClient.invalidateQueries({ queryKey: ['credit_parties_infinite'] });
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
      queryClient.invalidateQueries({ queryKey: ['credit_transactions_infinite', variables.party_id] });
      // Invalidate party list so net balances update
      queryClient.invalidateQueries({ queryKey: ['credit_parties'] });
      queryClient.invalidateQueries({ queryKey: ['credit_parties_infinite'] });
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
      queryClient.invalidateQueries({ queryKey: ['credit_transactions_infinite', partyId] });
      queryClient.invalidateQueries({ queryKey: ['credit_parties'] });
      queryClient.invalidateQueries({ queryKey: ['credit_parties_infinite'] });
    },
  });
};
