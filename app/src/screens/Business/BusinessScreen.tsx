import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, TrendingDown, Store } from 'lucide-react-native';
import { theme } from '../../theme';
import { useBusinesses, useBusinessIncome, useBusinessExpenses } from '../../lib/queries/business';

export default function BusinessScreen() {
  const router = useRouter();
  const { data: businesses, isLoading: loadingBusinesses } = useBusinesses();
  
  // State for selected business ID
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // If businesses are loaded and no business is selected, auto-select the first one
  React.useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  const { data: businessIncome, isLoading: loadingIncome } = useBusinessIncome(selectedBusinessId || undefined);
  const { data: businessExpenses, isLoading: loadingExpenses } = useBusinessExpenses(selectedBusinessId || undefined);

  const totalIncome = businessIncome?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  const totalExpenses = businessExpenses?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  const net = totalIncome - totalExpenses;

  const selectedBusiness = businesses?.find(b => b.id === selectedBusinessId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Ledger</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(app)/business/add')}
          >
            <Plus color={theme.colors.background} size={20} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {loadingBusinesses ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : businesses && businesses.length > 0 ? (
          <>
            <View style={styles.switcherContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
                {businesses.map((bus) => (
                  <TouchableOpacity
                    key={bus.id}
                    style={[
                      styles.switcherTab,
                      selectedBusinessId === bus.id && styles.switcherTabActive
                    ]}
                    onPress={() => setSelectedBusinessId(bus.id)}
                  >
                    <Store color={selectedBusinessId === bus.id ? theme.colors.background : theme.colors.textSecondary} size={16} />
                    <Text style={[
                      styles.switcherTabText,
                      selectedBusinessId === bus.id && styles.switcherTabTextActive
                    ]}>
                      {bus.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedBusinessId ? (
              <>
                <View style={styles.netCard}>
                  <Text style={styles.cardLabel}>Business Net ({selectedBusiness?.name})</Text>
                  <Text style={[styles.cardValue, { color: net >= 0 ? theme.colors.primary : '#FF4B4B' }]}>
                    ${Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {net < 0 && ' (Loss)'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
                  <View style={[styles.miniCard, { flex: 1 }]}>
                    <Text style={styles.cardLabel}>Total Income</Text>
                    <Text style={styles.miniCardValue}>${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={[styles.miniCard, { flex: 1 }]}>
                    <Text style={styles.cardLabel}>Total Expenses</Text>
                    <Text style={[styles.miniCardValue, { color: '#FF4B4B' }]}>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.grid}>
                  <TouchableOpacity 
                    style={styles.gridButton}
                    onPress={() => router.push({ pathname: '/(app)/business/[id]/add-income', params: { id: selectedBusinessId } })}
                  >
                    <TrendingUp color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
                    <Text style={styles.gridButtonText}>Add Income</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.gridButton}
                    onPress={() => router.push({ pathname: '/(app)/business/[id]/add-expense', params: { id: selectedBusinessId } })}
                  >
                    <TrendingDown color={theme.colors.textPrimary} size={24} style={styles.gridButtonIcon} />
                    <Text style={styles.gridButtonText}>Add Expense</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Store color={theme.colors.textSecondary} size={48} style={{ marginBottom: theme.spacing.md }} />
            <Text style={styles.emptyStateTitle}>No Businesses</Text>
            <Text style={styles.emptyStateSub}>Add a business to start tracking its income and expenses.</Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(app)/business/add')}
            >
              <Text style={styles.primaryButtonText}>Add Business</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    color: theme.colors.background,
    fontWeight: theme.typography.weights.semibold,
  },
  switcherContainer: {
    marginBottom: theme.spacing.xl,
  },
  switcherScroll: {
    gap: theme.spacing.sm,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  switcherTabActive: {
    backgroundColor: theme.colors.textPrimary,
    borderColor: theme.colors.textPrimary,
  },
  switcherTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
  },
  switcherTabTextActive: {
    color: theme.colors.background,
  },
  netCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  miniCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
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
  miniCardValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSub: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.md,
  },
});
