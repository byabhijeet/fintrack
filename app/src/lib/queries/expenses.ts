import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';
import { FinanceCategory } from './income';

export type FinanceEntry = {
  id: string;
  user_id: string;
  category_id: string | null;
  context: 'expense' | 'outflow';
  entry_date: string;
  amount: number;
  label: string | null;
  description: string | null;
  notes: string | null;
  receipt_url: string | null;
  tags: string[];
  meta: any;
  created_at: string;
  finance_categories?: FinanceCategory;
};

// Fetch categories for expenses and outflows
export const useExpenseCategories = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['finance_categories', 'expense_outflow', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .in('context', ['expense', 'outflow'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Seed fallback data if none exists
      if (!data || data.length === 0) {
        return [
          { id: 'seed-food', name: 'Food & Dining', context: 'expense', type: 'other', is_active: true } as FinanceCategory,
          { id: 'seed-shopping', name: 'Shopping', context: 'expense', type: 'other', is_active: true } as FinanceCategory,
          { id: 'seed-rent', name: 'Rent', context: 'outflow', type: 'fixed', is_active: true } as FinanceCategory,
          { id: 'seed-utilities', name: 'Utilities', context: 'outflow', type: 'fixed', is_active: true } as FinanceCategory,
        ];
      }

      return data as FinanceCategory[];
    },
    enabled: !!user,
  });
};

// Fetch expense/outflow entries
export const useExpenseEntries = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['finance_entries', 'expense_outflow', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
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
        .in('context', ['expense', 'outflow'])
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as FinanceEntry[];
    },
    enabled: !!user,
  });
};

// Add expense entry
export const useAddExpenseMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newEntry: Omit<FinanceEntry, 'id' | 'user_id' | 'created_at' | 'finance_categories'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('finance_entries')
        .insert([{
          ...newEntry,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as FinanceEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_entries', 'expense_outflow'] });
    },
  });
};

// Delete expense entry
export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('finance_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_entries', 'expense_outflow'] });
    },
  });
};
