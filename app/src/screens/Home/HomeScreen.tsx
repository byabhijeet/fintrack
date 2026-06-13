import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useIncomeEntries } from '../../lib/queries/income';
import { useExpenseEntries } from '../../lib/queries/expenses';
import { Banknote, History, CreditCard, Receipt } from 'lucide-react-native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: incomeEntries } = useIncomeEntries();
  const { data: expenseEntries } = useExpenseEntries();

  const totalIncome = incomeEntries?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  const totalExpenses = expenseEntries?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back to BillZest Finance</Text>
        
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
          <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={styles.cardValue}>${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.cardLabel}>Total Out</Text>
            <Text style={[styles.cardValue, { color: '#FF4B4B' }]}>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('AddIncome')}
          >
            <Banknote color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <CreditCard color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.grid, { marginTop: theme.spacing.md }]}>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('IncomeHistory')}
          >
            <History color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('ExpenseHistory')}
          >
            <History color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Expense History</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.grid, { marginTop: theme.spacing.md }]}>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => navigation.navigate('CreditCardList')}
          >
            <CreditCard color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
            <Text style={styles.gridButtonText}>Credit Cards</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
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
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  gridButton: {
    flex: 1,
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
});
