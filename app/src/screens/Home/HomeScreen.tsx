import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../store/uiStore';
import { Banknote, History, CreditCard, Store, EyeOff, Eye } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardSkeleton from '../../components/DashboardSkeleton';

export default function HomeScreen() {
  const router = useRouter();
  
  // Data & Aggregations from custom hook
  const {
    totalIncome,
    totalExpenses,
    ecosystemNet,
    chartData,
    recentActivity,
    isLoading
  } = useDashboardData();
  
  // UI state
  const { privacyMode, togglePrivacyMode } = useUIStore();

  const displayAmount = (amount: number) => {
    return privacyMode ? '***' : `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

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
