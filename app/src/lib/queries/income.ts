import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type FinanceCategory = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  context: 'expense' | 'outflow' | 'income' | 'business_expense';
  monthly_budget: number;
  meta_schema: string[];
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

export type IncomeEntry = {
  id: string;
  user_id: string;
  source_id: string;
  entry_date: string;
  amount: number;
  notes: string | null;
  meta: any;
  created_at: string;
  finance_categories?: FinanceCategory; // Joined category
};

// Fetch categories for income
export const useIncomeCategories = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['finance_categories', 'income', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('context', 'income')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // If no data, return default seeded options per user's instruction
      if (!data || data.length === 0) {
        return [
          { id: 'seed-salary', name: 'Salary', context: 'income', type: 'other', is_active: true } as FinanceCategory,
          { id: 'seed-freelance', name: 'Freelance', context: 'income', type: 'other', is_active: true } as FinanceCategory,
          { id: 'seed-investment', name: 'Investment', context: 'income', type: 'other', is_active: true } as FinanceCategory,
          { id: 'seed-other', name: 'Other', context: 'income', type: 'other', is_active: true } as FinanceCategory,
        ];
      }

      return data as FinanceCategory[];
    },
    enabled: !!user,
  });
};

const PAGE_SIZE = 10;

export const useInfiniteIncomeEntries = () => {
  const user = useAuthStore((state) => state.user);

  return useInfiniteQuery({
    queryKey: ['income_entries_infinite', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          finance_categories (
            id,
            name,
            context,
            type,
            is_active
          )
        `)
        .order('entry_date', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      return data as IncomeEntry[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!user,
  });
};

// Fetch income entries
export const useIncomeEntries = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['income_entries', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income_entries')
        .select(`
          *,
          finance_categories (
            id,
            name,
            context,
            type,
            is_active
          )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as IncomeEntry[];
    },
    enabled: !!user,
  });
};

// Add income entry
export const useAddIncomeMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newEntry: Omit<IncomeEntry, 'id' | 'user_id' | 'created_at' | 'finance_categories'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('income_entries')
        .insert([{
          ...newEntry,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as IncomeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_entries'] });
    },
  });
};

// Delete income entry
export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income_entries'] });
    },
  });
};
