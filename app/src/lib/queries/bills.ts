import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';
import { FinanceCategory } from './income';

export type RecurringTransaction = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category_id: string | null;
  next_due: string;
  last_run: string | null;
  is_active: boolean;
  created_at: string;
  finance_categories?: FinanceCategory;
};

// Fetch all bills (recurring transactions)
export const useBills = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['recurring_transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
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
        .order('next_due', { ascending: true });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });
};

// Fetch a single bill
export const useBill = (id: string | undefined) => {
  return useQuery({
    queryKey: ['recurring_templates', id],
    queryFn: async () => {
      if (!id) throw new Error('No bill ID provided');

      const { data, error } = await supabase
        .from('recurring_templates')
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
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as RecurringTemplate;
    },
    enabled: !!id,
  });
};

// Add a new bill
export const useAddBillMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newBill: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'finance_categories'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{
          ...newBill,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
    },
  });
};

// Update an existing bill
export const useUpdateBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<RecurringTransaction> & { id: string }) => {
      const { id, finance_categories, created_at, user_id, ...rest } = updates;
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(rest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
    },
  });
};

// Delete a bill
export const useDeleteBillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_templates'] });
    },
  });
};

// Manually trigger payment of a bill
export const useMarkBillPaidMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: RecurringTransaction) => {
      // 1. Insert into finance_entries
      const { error: pErr } = await supabase.from('finance_entries').insert({
        user_id: bill.user_id,
        category_id: bill.category_id,
        amount: bill.amount,
        description: `[Manual] ${bill.title}`,
        entry_date: new Date().toISOString().split('T')[0],
        context: 'expense'
      });

      if (pErr) throw pErr;

      // 2. Calculate next_due
      const nextDue = new Date(bill.next_due);
      if (bill.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
      else if (bill.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
      else if (bill.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
      else if (bill.frequency === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

      const todayStr = new Date().toISOString().split('T')[0];

      // 3. Update the recurring transaction
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update({
          last_run: todayStr,
          next_due: nextDue.toISOString().split('T')[0]
        })
        .eq('id', bill.id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance_entries'] });
    },
  });
};

// Auto process due bills (This remains for backward compatibility or app-side fallback)
export const processRecurringTransactions = async (userId: string) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const { data: templates, error: tErr } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_due', todayStr);

  if (tErr) throw tErr;
  if (!templates || templates.length === 0) return 0;

  let processedCount = 0;
  for (const t of templates) {
    const { error: pErr } = await supabase.from('finance_entries').insert({
      user_id: t.user_id,
      category_id: t.category_id,
      amount: t.amount,
      description: `[Auto] ${t.title}`,
      entry_date: t.next_due,
      context: 'expense'
    });

    if (!pErr) {
      processedCount++;
      const nextDue = new Date(t.next_due);
      if (t.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
      else if (t.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
      else if (t.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
      else if (t.frequency === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

      await supabase.from('recurring_transactions').update({
        last_run: t.next_due,
        next_due: nextDue.toISOString().split('T')[0]
      }).eq('id', t.id);
    }
  }
  return processedCount;
};
