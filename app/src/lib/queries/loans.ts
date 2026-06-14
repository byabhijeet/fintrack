import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';
import { AmortizationRow, generateAmortizationSchedule } from '../loanMath';

export interface Loan {
  id: string;
  user_id: string;
  lender_name: string;
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  interest_type: 'reducing' | 'flat';
  tenure_months: number;
  start_date: string;
  emi_day: number | null;
  account_number: string | null;
  foreclosure_charge_percent: number | null;
  notes: string | null;
  emi_amount: number;
  status: 'active' | 'closed' | 'foreclosed';
  created_at?: string;
  loan_amortisation_schedule?: AmortizationScheduleRow[];
}

export interface AmortizationScheduleRow {
  id: string;
  loan_id: string;
  user_id: string;
  installment_no: number;
  emi_month: string;
  principal_component: number;
  interest_component: number;
  closing_balance: number;
  status: 'pending' | 'paid';
  actual_payment_id: string | null;
}

export function useLoans() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['loans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Loan[];
    },
    enabled: !!user?.id,
  });
}

export function useLoan(loanId: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['loans', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          loan_amortisation_schedule (*)
        `)
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      
      // Sort schedule by installment_no ascending
      if (data.loan_amortisation_schedule) {
        data.loan_amortisation_schedule.sort((a: any, b: any) => a.installment_no - b.installment_no);
      }
      
      return data as Loan;
    },
    enabled: !!user?.id && !!loanId,
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (newLoan: Omit<Loan, 'id' | 'user_id' | 'status' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');

      // 1. Insert the loan
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert([{
          ...newLoan,
          user_id: user.id,
          status: 'active'
        }])
        .select()
        .single();

      if (loanError) throw loanError;

      // 2. Generate Amortization Schedule
      const schedule = generateAmortizationSchedule(
        newLoan.principal_amount,
        newLoan.interest_rate,
        newLoan.tenure_months,
        newLoan.interest_type,
        newLoan.start_date,
        newLoan.emi_day || 1
      );

      // 3. Insert Amortization Schedule
      const scheduleRows = schedule.map((row) => ({
        ...row,
        loan_id: loan.id,
        user_id: user.id,
        status: 'pending'
      }));

      const { error: scheduleError } = await supabase
        .from('loan_amortisation_schedule')
        .insert(scheduleRows);

      if (scheduleError) throw scheduleError;

      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function usePayEMI() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ loanId, scheduleId, amount, principal, interest }: { 
      loanId: string, 
      scheduleId: string, 
      amount: number, 
      principal: number, 
      interest: number 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // 1. Insert payment record
      const { data: payment, error: paymentError } = await supabase
        .from('loan_emi_payments')
        .insert([{
          loan_id: loanId,
          user_id: user.id,
          payment_date: today,
          principal_paid: principal,
          interest_paid: interest,
          total_paid: amount
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Update schedule row to 'paid' and link payment
      const { error: updateError } = await supabase
        .from('loan_amortisation_schedule')
        .update({
          status: 'paid',
          actual_payment_id: payment.id
        })
        .eq('id', scheduleId);

      if (updateError) throw updateError;

      return payment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans', variables.loanId] });
    },
  });
}

export function usePartPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      amount,
      impactType,
      newEmi,
      newTenureMonths,
      monthsSaved,
      interestSaved,
      outstandingBefore,
      outstandingAfter,
      newSchedule,
      paymentMode,
      referenceNumber,
      notes,
    }: {
      loanId: string;
      amount: number;
      impactType: 'reduce_emi' | 'reduce_tenure';
      newEmi: number;
      newTenureMonths: number;
      monthsSaved: number;
      interestSaved: number;
      outstandingBefore: number;
      outstandingAfter: number;
      newSchedule: AmortizationRow[];
      paymentMode?: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // 1. Insert into loan_part_payments
      const { error: partPaymentError } = await supabase
        .from('loan_part_payments')
        .insert([{
          loan_id: loanId,
          user_id: user.id,
          payment_date: today,
          amount,
          impact_type: impactType,
          new_emi: newEmi,
          new_tenure_months: newTenureMonths,
          months_saved: monthsSaved,
          interest_saved: interestSaved,
          outstanding_before: outstandingBefore,
          outstanding_after: outstandingAfter,
          payment_mode: paymentMode || 'NEFT',
          reference_number: referenceNumber,
          notes,
        }]);

      if (partPaymentError) throw partPaymentError;

      // 2. Delete pending schedule rows for this loan
      const { error: deleteError } = await supabase
        .from('loan_amortisation_schedule')
        .delete()
        .eq('loan_id', loanId)
        .eq('status', 'pending');

      if (deleteError) throw deleteError;

      // 3. Insert new schedule rows
      if (newSchedule.length > 0) {
        const scheduleRows = newSchedule.map(row => ({
          ...row,
          loan_id: loanId,
          user_id: user.id,
          status: 'pending'
        }));
        
        const { error: scheduleError } = await supabase
          .from('loan_amortisation_schedule')
          .insert(scheduleRows);

        if (scheduleError) throw scheduleError;
      }

      // 4. Update loan emi or tenure
      const updateData: any = {};
      if (impactType === 'reduce_emi') updateData.emi_amount = newEmi;
      if (impactType === 'reduce_tenure') updateData.tenure_months = newTenureMonths;
      
      if (newSchedule.length === 0) {
         updateData.status = 'closed';
      }

      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId);

      if (loanUpdateError) throw loanUpdateError;

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans', variables.loanId] });
    },
  });
}

export function useForeclosure() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      outstandingPrincipal,
      foreclosureChargePct,
      foreclosureChargeType,
      foreclosureChargeAmount,
      totalPayable,
      interestSaved,
      paymentMode,
      referenceNumber,
      notes,
    }: {
      loanId: string;
      outstandingPrincipal: number;
      foreclosureChargePct: number;
      foreclosureChargeType: string;
      foreclosureChargeAmount: number;
      totalPayable: number;
      interestSaved: number;
      paymentMode?: string;
      referenceNumber?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // 1. Insert into loan_foreclosures
      const { error: foreclosureError } = await supabase
        .from('loan_foreclosures')
        .insert([{
          loan_id: loanId,
          user_id: user.id,
          foreclosure_date: today,
          outstanding_principal: outstandingPrincipal,
          foreclosure_charge_pct: foreclosureChargePct,
          foreclosure_charge_type: foreclosureChargeType,
          foreclosure_charge_amount: foreclosureChargeAmount,
          total_payable: totalPayable,
          interest_saved: interestSaved,
          payment_mode: paymentMode || 'NEFT',
          reference_number: referenceNumber,
          notes,
        }]);

      if (foreclosureError) throw foreclosureError;

      // 2. Delete pending schedule rows
      const { error: deleteError } = await supabase
        .from('loan_amortisation_schedule')
        .delete()
        .eq('loan_id', loanId)
        .eq('status', 'pending');

      if (deleteError) throw deleteError;

      // 3. Update loan status
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({ status: 'foreclosed' })
        .eq('id', loanId);

      if (loanUpdateError) throw loanUpdateError;

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans', variables.loanId] });
    },
  });
}
