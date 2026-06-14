import React, { useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useRouter } from 'expo-router';
import { useIncomeEntries } from '../../lib/queries/income';
import { useExpenseEntries } from '../../lib/queries/expenses';
import { useAllBusinessIncome, useAllBusinessExpenses } from '../../lib/queries/business';
import { processRecurringTransactions } from '../../lib/queries/bills';
import { useAllCardSpends } from '../../lib/queries/creditCards';
import { useCreditParties } from '../../lib/queries/creditBook';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Banknote, History, CreditCard, Store, EyeOff, Eye } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  
  // Data queries
  const { data: incomeEntries } = useIncomeEntries();
  const { data: expenseEntries } = useExpenseEntries();
  const { data: businessIncome } = useAllBusinessIncome();
  const { data: businessExpenses } = useAllBusinessExpenses();
  const { data: cardSpends } = useAllCardSpends();
  const { data: creditParties } = useCreditParties();
  
  // UI state
  const { privacyMode, togglePrivacyMode } = useUIStore();
  const user = useAuthStore((state) => state.user);

  // Fetch loan EMI payments and part payments
  const [loanPayments, setLoanPayments] = React.useState<any[]>([]);
  const [partPayments, setPartPayments] = React.useState<any[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      // Fetch loan EMI payments
      (async () => {
        const { data } = await supabase
          .from('loan_emi_payments')
          .select('*')
          .eq('user_id', user.id);
        setLoanPayments(data || []);
      })();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      // Fetch loan part payments
      (async () => {
        const { data } = await supabase
          .from('loan_part_payments')
          .select('*')
          .eq('user_id', user.id);
        setPartPayments(data || []);
      })();
    }
  }, [user?.id]);

  // Fetch credit book transactions for all parties
  const [creditTransactions, setCreditTransactions] = React.useState<any[]>([]);
  
  useEffect(() => {
    if (user?.id && creditParties && creditParties.length > 0) {
      (async () => {
        const { data } = await supabase
          .from('personal_credit_transactions')
          .select('*')
          .eq('creator_id', user.id);
        setCreditTransactions(data || []);
      })();
    }
  }, [user?.id, creditParties]);

  useEffect(() => {
    if (user?.id) {
      processRecurringTransactions(user.id).catch(console.error);
    }
  }, [user?.id]);

  // Aggregations
  const { totalIncome, totalExpenses, ecosystemNet, chartData, recentActivity } = useMemo(() => {
    let personalIn = 0;
    let personalOut = 0;
    let bizIn = 0;
    let bizOut = 0;
    let cardsOut = 0;
    let loanEmiOut = 0;
    let loanPartPaymentOut = 0;
    let creditReceivables = 0;
    let creditPayables = 0;

    const allTransactions: { id: string; date: string; amount: number; title: string; type: 'inflow' | 'outflow' }[] = [];

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

    // Credit Book: Calculate net for all parties
    creditTransactions?.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'gave') {
        creditReceivables += amount; // Money owed to me (I gave/lent)
      } else if (t.type === 'got') {
        creditPayables += amount; // Money I owe (I got/borrowed)
      }
      // Only add to transactions if not settled
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

    // Ecosystem Net Formula
    // Ecosystem Net = (Personal Income + Business Income + Credit Receivables) - (Personal Expenses + Card Spends + Business Expenses + Loan EMIs + Loan Part Payments + Credit Payables)
    const tIn = personalIn + bizIn + creditReceivables;
    const tOut = personalOut + bizOut + cardsOut + loanEmiOut + loanPartPaymentOut + creditPayables;
    const net = tIn - tOut;

    // Monthly Chart Data (simplified for demo: just aggregate last 6 months)
    const monthlyMap: Record<string, { inflow: number; outflow: number }> = {};
    const d = new Date();
    for(let i=5; i>=0; i--) {
      const month = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = month.toISOString().substring(0, 7); // YYYY-MM
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
        frontColor: '#1ED760' // Neon Green
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

  const displayAmount = (amount: number) => {
    return privacyMode ? '***' : `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back to BillZest Finance</Text>
          </View>
          <TouchableOpacity onPress={togglePrivacyMode} style={styles.privacyToggle}>
            {privacyMode ? <EyeOff color={theme.colors.textSecondary} size={24} /> : <Eye color={theme.colors.textSecondary} size={24} />}
          </TouchableOpacity>
        </View>
        
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Ecosystem Net</Text>
          <Text style={[styles.netValue, ecosystemNet < 0 && { color: '#FF4B4B' }]}>
            {displayAmount(ecosystemNet)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
          <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.cardLabel}>Total Inflow</Text>
            <Text style={styles.cardValue}>{displayAmount(totalIncome)}</Text>
          </View>
          <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.cardLabel}>Total Outflow</Text>
            <Text style={[styles.cardValue, { color: '#FF4B4B' }]}>{displayAmount(totalExpenses)}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Cash Flow (Last 6 Months)</Text>
          <BarChart
            data={chartData}
            barWidth={12}
            spacing={16}
            roundedTop
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{color: theme.colors.textSecondary}}
            noOfSections={4}
            maxValue={Math.max(1000, ...chartData.map(d => d.value)) * 1.1}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/(home)/add-income')}>
            <Banknote color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/(home)/add-expense')}>
            <CreditCard color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/credit-cards')}>
            <CreditCard color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Credit Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/business')}>
            <Store color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Business Ledger</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/loans')}>
            <Banknote color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Loan Tracker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/(app)/bills')}>
            <History color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>My Bills</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.xl }]}>Recent Transactions</Text>
        <View style={styles.activityList}>
          {recentActivity.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <View>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityDate}>{new Date(act.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.activityAmount, act.type === 'outflow' ? { color: '#FF4B4B' } : { color: '#1ED760' }]}>
                {act.type === 'outflow' ? '-' : '+'}{displayAmount(act.amount)}
              </Text>
            </View>
          ))}
          {recentActivity.length === 0 && (
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.md }}>No recent activity</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  privacyToggle: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  netCard: {
    width: '100%',
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  netLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.xs,
  },
  netValue: {
    color: theme.colors.textPrimary,
    fontSize: 40,
    fontWeight: theme.typography.weights.bold,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.xs,
  },
  cardValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  gridButton: {
    width: 160,
    flexGrow: 1,
    maxWidth: 240,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  gridButtonIcon: {
    marginBottom: theme.spacing.sm,
  },
  gridButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  activityList: {
    gap: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  activityTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  activityAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});
