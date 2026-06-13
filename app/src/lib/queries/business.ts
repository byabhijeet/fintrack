import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type Business = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type BusinessIncome = {
  id: string;
  user_id: string;
  business_id: string;
  entry_date: string;
  amount: number;
  source_description: string;
  notes: string | null;
  created_at: string;
};

export type BusinessExpense = {
  id: string;
  user_id: string;
  business_id: string;
  entry_date: string;
  amount: number;
  category: string;
  description: string;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
};

// Fetch businesses
export const useBusinesses = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Business[];
    },
    enabled: !!user,
  });
};

// Add business
export const useAddBusinessMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newBusiness: Pick<Business, 'name' | 'description'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          ...newBusiness,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

// Fetch business income
export const useBusinessIncome = (businessId?: string) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['business_income', user?.id, businessId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_income')
        .select('*')
        .eq('business_id', businessId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as BusinessIncome[];
    },
    enabled: !!user && !!businessId,
  });
};

// Fetch all business income for dashboard
export const useAllBusinessIncome = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['business_income_all', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_income')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as BusinessIncome[];
    },
    enabled: !!user,
  });
};

// Add business income
export const useAddBusinessIncomeMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newEntry: Omit<BusinessIncome, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_income')
        .insert([{
          ...newEntry,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as BusinessIncome;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business_income', user?.id, variables.business_id] });
    },
  });
};

// Fetch business expenses
export const useBusinessExpenses = (businessId?: string) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['business_expenses', user?.id, businessId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .eq('business_id', businessId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as BusinessExpense[];
    },
    enabled: !!user && !!businessId,
  });
};

// Fetch all business expenses for dashboard
export const useAllBusinessExpenses = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['business_expenses_all', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_expenses')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as BusinessExpense[];
    },
    enabled: !!user,
  });
};

// Add business expense
export const useAddBusinessExpenseMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (newEntry: Omit<BusinessExpense, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_expenses')
        .insert([{
          ...newEntry,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as BusinessExpense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business_expenses', user?.id, variables.business_id] });
    },
  });
};
