import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SplitGroup = {
  id: string;
  creator_id: string;
  name: string;
  type: 'trip' | 'home' | 'office' | 'couple' | 'other';
  icon?: string;
  cover_color?: string;
  context?: string;
  created_at: string;
};

export type SplitGroupMember = {
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

export type SplitExpense = {
  id: string;
  group_id: string;
  payer_id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  expense_date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  split_expense_participants?: SplitExpenseParticipant[];
};

export type SplitExpenseParticipant = {
  id: string;
  expense_id: string;
  user_id?: string;
  friend_mob: string;
  share_amount: number;
  share_percent?: number;
  split_type: 'equal' | 'manual' | 'percent' | 'share' | 'itemized';
  created_at: string;
};

// ---------------------------------------------------------------------------
// Penny Algorithm & Calculations
// ---------------------------------------------------------------------------

export interface SplitCalculation {
  participantId: string;
  mobile: string;
  splitType: 'equal' | 'percent' | 'exact' | 'shares';
  value: number; // For percent: percentage, for shares: number of shares, for exact: amount
  calculatedShare: number; // Final share after penny rounding
}

/**
 * Penny-perfect splitting algorithm.
 * Ensures:
 * 1. All shares sum exactly to the total amount (no rounding errors)
 * 2. Shares are fairly distributed
 * 3. "Penny" corrections go to those who would lose the most
 */
export function calculatePennyPerfectSplit(
  totalAmount: number,
  splitCalcs: Array<{ mobile: string; splitType: 'equal' | 'percent' | 'exact' | 'shares'; value: number }>,
  precision: number = 2
): SplitCalculation[] {
  const decimalMultiplier = Math.pow(10, precision);
  const totalCents = Math.round(totalAmount * decimalMultiplier);

  let results: SplitCalculation[] = [];
  let allocatedCents = 0;
  let roundedShares: { mobile: string; centsShare: number; decimal: number; index: number }[] = [];

  // STEP 1: Calculate raw shares based on split type
  if (splitCalcs.every(c => c.splitType === 'equal')) {
    // Equal split
    const equalShare = totalCents / splitCalcs.length;
    splitCalcs.forEach((calc, idx) => {
      roundedShares.push({
        mobile: calc.mobile,
        centsShare: Math.floor(equalShare),
        decimal: equalShare - Math.floor(equalShare),
        index: idx,
      });
    });
  } else if (splitCalcs.every(c => c.splitType === 'percent')) {
    // Percent-based split
    const totalPercent = splitCalcs.reduce((sum, c) => sum + c.value, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error('Percentages must sum to 100%');
    }

    splitCalcs.forEach((calc, idx) => {
      const percentShare = (calc.value / 100) * totalCents;
      roundedShares.push({
        mobile: calc.mobile,
        centsShare: Math.floor(percentShare),
        decimal: percentShare - Math.floor(percentShare),
        index: idx,
      });
    });
  } else if (splitCalcs.every(c => c.splitType === 'exact')) {
    // Exact amounts
    const totalExact = splitCalcs.reduce((sum, c) => sum + c.value * decimalMultiplier, 0);
    if (Math.abs(totalExact - totalCents) > 1) {
      throw new Error('Exact amounts must sum to the total');
    }

    splitCalcs.forEach((calc, idx) => {
      const exactCents = Math.round(calc.value * decimalMultiplier);
      roundedShares.push({
        mobile: calc.mobile,
        centsShare: exactCents,
        decimal: 0,
        index: idx,
      });
    });
  } else if (splitCalcs.every(c => c.splitType === 'shares')) {
    // Share-based split (e.g., 2 shares, 3 shares, 1 share)
    const totalShares = splitCalcs.reduce((sum, c) => sum + c.value, 0);
    splitCalcs.forEach((calc, idx) => {
      const shareAmount = (calc.value / totalShares) * totalCents;
      roundedShares.push({
        mobile: calc.mobile,
        centsShare: Math.floor(shareAmount),
        decimal: shareAmount - Math.floor(shareAmount),
        index: idx,
      });
    });
  }

  // STEP 2: Calculate remainder and distribute pennies
  allocatedCents = roundedShares.reduce((sum, r) => sum + r.centsShare, 0);
  const remainder = totalCents - allocatedCents;

  // Sort by decimal part (descending) to give pennies to those losing most
  roundedShares.sort((a, b) => b.decimal - a.decimal);

  // Distribute remaining cents
  for (let i = 0; i < remainder; i++) {
    if (i < roundedShares.length) {
      roundedShares[i].centsShare += 1;
    }
  }

  // STEP 3: Build results
  results = roundedShares.map(rs => ({
    participantId: `${rs.index}`,
    mobile: rs.mobile,
    splitType: splitCalcs[rs.index].splitType,
    value: splitCalcs[rs.index].value,
    calculatedShare: rs.centsShare / decimalMultiplier,
  }));

  return results;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all split groups for the authenticated user */
export const useSplitGroups = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['split_groups', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('split_groups')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SplitGroup[];
    },
    enabled: !!user,
  });
};

/** Fetch a single split group with members */
export const useSplitGroup = (groupId: string) => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['split_groups', groupId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('split_groups')
        .select(`
          *,
          split_group_members (*)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as SplitGroup & { split_group_members: SplitGroupMember[] };
    },
    enabled: !!user && !!groupId,
  });
};

/** Fetch all expenses for a group */
export const useGroupExpenses = (groupId: string) => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['group_expenses', groupId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('split_expenses')
        .select(`
          *,
          split_expense_participants (*)
        `)
        .eq('group_id', groupId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data as SplitExpense[];
    },
    enabled: !!user && !!groupId,
  });
};

/** Calculate balances for a group (who owes whom) */
export const useGroupBalances = (groupId: string) => {
  const { data: expenses } = useGroupExpenses(groupId);

  const balances = React.useMemo(() => {
    const balanceMap: Record<string, number> = {};

    expenses?.forEach((exp) => {
      const payerId = exp.payer_id;
      const amount = Number(exp.amount);

      // Initialize payer if not exists
      if (!balanceMap[payerId]) balanceMap[payerId] = 0;

      // Add amount to payer (they paid)
      balanceMap[payerId] += amount;

      // Deduct shares from participants
      exp.split_expense_participants?.forEach((participant) => {
        const mobKey = `${participant.friend_mob}:mobile`;
        if (!balanceMap[mobKey]) balanceMap[mobKey] = 0;
        balanceMap[mobKey] -= Number(participant.share_amount);
      });
    });

    return balanceMap;
  }, [expenses]);

  return balances;
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type AddGroupInput = {
  name: string;
  type: 'trip' | 'home' | 'office' | 'couple' | 'other';
  icon?: string;
  cover_color?: string;
  context?: string;
};

export const useAddGroupMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: AddGroupInput): Promise<SplitGroup> => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('split_groups')
        .insert([
          {
            creator_id: user.id,
            name: input.name,
            type: input.type,
            icon: input.icon,
            cover_color: input.cover_color,
            context: input.context,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as SplitGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split_groups'] });
    },
  });
};

export type AddExpenseInput = {
  group_id: string;
  payer_id: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  notes?: string;
  receipt_url?: string;
  participants: Array<{
    friend_mob: string;
    split_type: 'equal' | 'manual' | 'percent' | 'share' | 'itemized';
    value: number; // Amount for manual, percentage for percent, shares for share
  }>;
};

export const useAddExpenseMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: AddExpenseInput) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Insert the expense
      const { data: expense, error: expError } = await supabase
        .from('split_expenses')
        .insert([
          {
            group_id: input.group_id,
            payer_id: input.payer_id,
            amount: input.amount,
            description: input.description,
            category: input.category,
            expense_date: input.expense_date,
            notes: input.notes,
            receipt_url: input.receipt_url,
          },
        ])
        .select()
        .single();

      if (expError) throw expError;

      // 2. Calculate penny-perfect splits
      const splitCalcs = input.participants.map((p) => ({
        mobile: p.friend_mob,
        splitType: p.split_type as 'equal' | 'percent' | 'exact' | 'shares',
        value: p.value,
      }));

      let splits: SplitCalculation[] = [];
      if (input.participants[0].split_type === 'equal') {
        splits = calculatePennyPerfectSplit(
          input.amount,
          splitCalcs.map((s) => ({ ...s, splitType: 'equal' as const, value: 1 }))
        );
      } else if (input.participants[0].split_type === 'percent') {
        splits = calculatePennyPerfectSplit(input.amount, splitCalcs);
      } else if (input.participants[0].split_type === 'share') {
        splits = calculatePennyPerfectSplit(input.amount, splitCalcs);
      } else {
        // Manual: use as-is
        splits = splitCalcs.map((s, idx) => ({
          participantId: `${idx}`,
          mobile: s.mobile,
          splitType: s.splitType,
          value: s.value,
          calculatedShare: s.value,
        }));
      }

      // 3. Insert participants
      const participantRows = splits.map((split, idx) => ({
        expense_id: expense.id,
        friend_mob: split.mobile,
        share_amount: split.calculatedShare,
        share_percent:
          input.participants[idx].split_type === 'percent' ? input.participants[idx].value : null,
        split_type: input.participants[idx].split_type,
      }));

      const { error: partError } = await supabase
        .from('split_expense_participants')
        .insert(participantRows);

      if (partError) throw partError;

      return expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group_expenses', variables.group_id] });
    },
  });
};
