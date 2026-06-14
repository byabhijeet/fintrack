import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useSplitGroup, useGroupExpenses, useGroupBalances } from '../../lib/queries/splits';
import { Plus, Home, Plane, Briefcase, Heart, FileText } from 'lucide-react-native';

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: group, isLoading: groupLoading } = useSplitGroup(id || '');
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(id || '');
  const balances = useGroupBalances(id || '');

  if (groupLoading || expensesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAmount = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 32, color: 'white' };
    const icons: Record<string, React.ReactNode> = {
      trip: <Plane {...iconProps} />,
      home: <Home {...iconProps} />,
      office: <Briefcase {...iconProps} />,
      couple: <Heart {...iconProps} />,
      other: <FileText {...iconProps} />,
    };
    return icons[type] || <FileText {...iconProps} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Header */}
        <View style={[styles.groupHeader, { backgroundColor: group.cover_color || theme.colors.primary }]}>
          <View style={styles.groupTypeIcon}>{getTypeIcon(group.type)}</View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupMemberCount}>
            {group.split_group_members?.length || 0} members
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{expenses?.length || 0}</Text>
          </View>
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity
          style={styles.addExpenseButton}
          onPress={() => router.push({
            pathname: '/(app)/(tabs)/split/add-expense',
            params: { groupId: id }
          })}
        >
          <Plus color="white" size={24} />
          <Text style={styles.addExpenseText}>Add Expense</Text>
        </TouchableOpacity>

        {/* Expenses List */}
        {expenses && expenses.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            <View style={styles.expensesList}>
              {expenses.map((expense) => (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>₹{Number(expense.amount).toLocaleString('en-IN')}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Expenses Yet</Text>
            <Text style={styles.emptyText}>Add an expense to get started</Text>
          </View>
        )}

        {/* Balances */}
        {Object.keys(balances).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Balances</Text>
            <View style={styles.balancesList}>
              {Object.entries(balances)
                .filter(([_, balance]) => balance !== 0)
                .map(([key, balance]) => (
                  <View key={key} style={styles.balanceItem}>
                    <Text style={styles.balanceKey}>{key.includes(':mobile') ? key.split(':')[0] : 'Member'}</Text>
                    <Text
                      style={[
                        styles.balanceValue,
                        {
                          color: balance > 0 ? '#1ED760' : '#FF4B4B',
                        },
                      ]}
                    >
                      {balance > 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
            </View>
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
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  groupHeader: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  groupTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  groupName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  groupMemberCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.sizes.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  addExpenseButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  addExpenseText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  expensesList: {
    gap: theme.spacing.md,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  expenseAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  balancesList: {
    gap: theme.spacing.md,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  balanceKey: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  balanceValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});
