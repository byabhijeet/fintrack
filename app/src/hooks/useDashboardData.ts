import { useMemo, useEffect } from 'react';
import { theme } from '../theme';
import { useIncomeEntries } from '../lib/queries/income';
import { useExpenseEntries } from '../lib/queries/expenses';
import { useAllBusinessIncome, useAllBusinessExpenses } from '../lib/queries/business';
import { processRecurringTransactions } from '../lib/queries/bills';
import { useAllCardSpends } from '../lib/queries/creditCards';
import { useCreditParties, useAllCreditTransactions } from '../lib/queries/creditBook';
import { useAllLoanEMIPayments, useAllLoanPartPayments } from '../lib/queries/loans';
import { useAuthStore } from '../store/authStore';

export interface DashboardTransaction {
  id: string;
  date: string;
  amount: number;
  title: string;
  type: 'inflow' | 'outflow';
}

export function useDashboardData() {
  const user = useAuthStore((state) => state.user);

  // Data queries
  const { data: incomeEntries, isLoading: isLoadingIncome } = useIncomeEntries();
  const { data: expenseEntries, isLoading: isLoadingExpenses } = useExpenseEntries();
  const { data: businessIncome, isLoading: isLoadingBizIncome } = useAllBusinessIncome();
  const { data: businessExpenses, isLoading: isLoadingBizExpenses } = useAllBusinessExpenses();
  const { data: cardSpends, isLoading: isLoadingCards } = useAllCardSpends();
  const { data: creditParties, isLoading: isLoadingParties } = useCreditParties();
  const { data: creditTransactions, isLoading: isLoadingCreditTxns } = useAllCreditTransactions();
  const { data: loanPayments, isLoading: isLoadingLoanPayments } = useAllLoanEMIPayments();
  const { data: partPayments, isLoading: isLoadingPartPayments } = useAllLoanPartPayments();

  useEffect(() => {
    if (user?.id) {
      processRecurringTransactions(user.id).catch(console.error);
    }
  }, [user?.id]);

  const isLoading =
    isLoadingIncome ||
    isLoadingExpenses ||
    isLoadingBizIncome ||
    isLoadingBizExpenses ||
    isLoadingCards ||
    isLoadingParties ||
    isLoadingCreditTxns ||
    isLoadingLoanPayments ||
    isLoadingPartPayments;

  const aggregations = useMemo(() => {
    let personalIn = 0;
    let personalOut = 0;
    let bizIn = 0;
    let bizOut = 0;
    let cardsOut = 0;
    let loanEmiOut = 0;
    let loanPartPaymentOut = 0;
    let creditReceivables = 0;
    let creditPayables = 0;

    const allTransactions: DashboardTransaction[] = [];

    // Personal Income
    incomeEntries?.forEach(e => {
      personalIn += Number(e.amount);
      allTransactions.push({ id: `inc_${e.id}`, date: e.entry_date, amount: Number(e.amount), title: 'Income', type: 'inflow' });
    });

    // Personal Expenses
    expenseEntries?.forEach(e => {
      personalOut += Number(e.amount);
      allTransactions.push({ id: `exp_${e.id}`, date: e.entry_date, amount: Number(e.amount), title: e.label || 'Expense', type: 'outflow' });
    });

    // Business Income
    businessIncome?.forEach(e => {
      bizIn += Number(e.amount);
      allTransactions.push({ id: `biz_in_${e.id}`, date: e.entry_date, amount: Number(e.amount), title: 'Business Income', type: 'inflow' });
    });

    // Business Expenses
    businessExpenses?.forEach(e => {
      bizOut += Number(e.amount);
      allTransactions.push({ id: `biz_out_${e.id}`, date: e.entry_date, amount: Number(e.amount), title: 'Business Expense', type: 'outflow' });
    });

    // Card Spends
    cardSpends?.forEach(e => {
      cardsOut += Number(e.amount);
      allTransactions.push({ id: `card_${e.id}`, date: e.spend_date, amount: Number(e.amount), title: e.merchant || 'Card Spend', type: 'outflow' });
    });

    // Loan EMI Payments
    loanPayments?.forEach(e => {
      loanEmiOut += Number(e.total_paid);
      allTransactions.push({ id: `emi_${e.id}`, date: e.payment_date, amount: Number(e.total_paid), title: 'Loan EMI', type: 'outflow' });
    });

    // Loan Part Payments
    partPayments?.forEach(e => {
      loanPartPaymentOut += Number(e.amount);
      allTransactions.push({ id: `part_${e.id}`, date: e.payment_date, amount: Number(e.amount), title: 'Loan Part Payment', type: 'outflow' });
    });

    // Credit Book
    creditTransactions?.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'gave') {
        creditReceivables += amount;
      } else if (t.type === 'got') {
        creditPayables += amount;
      }
      if (!t.settled) {
        allTransactions.push({
          id: `credit_${t.id}`,
          date: t.txn_date,
          amount: amount,
          title: t.type === 'gave' ? 'Credit Receivable' : 'Credit Payable',
          type: t.type === 'gave' ? 'inflow' : 'outflow'
        });
      }
    });

    const tIn = personalIn + bizIn + creditReceivables;
    const tOut = personalOut + bizOut + cardsOut + loanEmiOut + loanPartPaymentOut + creditPayables;
    const net = tIn - tOut;

    // Monthly Chart Data
    const monthlyMap: Record<string, { inflow: number; outflow: number }> = {};
    const d = new Date();
    for(let i=5; i>=0; i--) {
      const month = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = month.toISOString().substring(0, 7);
      monthlyMap[key] = { inflow: 0, outflow: 0 };
    }

    allTransactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (monthlyMap[key]) {
        if (t.type === 'inflow') monthlyMap[key].inflow += t.amount;
        else monthlyMap[key].outflow += t.amount;
      }
    });

    const cData: any[] = [];
    Object.keys(monthlyMap).sort().forEach(k => {
      const mName = new Date(k + '-01').toLocaleString('default', { month: 'short' });
      cData.push({
        value: monthlyMap[k].inflow,
        label: mName,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: {color: theme.colors.textSecondary},
        frontColor: '#1ED760'
      });
      cData.push({
        value: monthlyMap[k].outflow,
        frontColor: '#FF4B4B'
      });
    });

    return {
      totalIncome: tIn,
      totalExpenses: tOut,
      ecosystemNet: net,
      chartData: cData,
      recentActivity: allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [incomeEntries, expenseEntries, businessIncome, businessExpenses, cardSpends, loanPayments, partPayments, creditTransactions]);

  return {
    ...aggregations,
    isLoading
  };
}
