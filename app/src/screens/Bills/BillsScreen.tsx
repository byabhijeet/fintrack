
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useBills, useMarkBillPaidMutation, RecurringTemplate } from '@/lib/queries/bills';
import { Plus, CheckCircle, Calendar, RefreshCw } from 'lucide-react-native';
import { useUIStore } from '@/store/uiStore';

export default function BillsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { data: bills, isLoading } = useBills();
  const { privacyMode } = useUIStore();
  const markPaidMutation = useMarkBillPaidMutation();

  const displayAmount = (amount: number) => {
    return privacyMode ? '***' : `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleMarkPaid = (bill: RecurringTemplate) => {
    markPaidMutation.mutate(bill);
  };

  const renderBill = ({ item }: { item: RecurringTemplate }) => {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = item.next_due < today;
    const isDueToday = item.next_due === today;
    const isActive = item.is_active;

    let statusColor = colors.textSecondary;
    if (isActive) {
      if (isOverdue) statusColor = '#FF4B4B'; // Red
      else if (isDueToday) statusColor = '#F59E0B'; // Orange
      else statusColor = colors.primary; // Green
    }

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          !isActive && { opacity: 0.6 }
        ]}
        onPress={() => router.push(`/(app)/bills/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {item.finance_categories?.name || 'General'} • {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            </Text>
          </View>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>{displayAmount(item.amount)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dueContainer}>
            <Calendar size={16} color={statusColor} />
            <Text style={[styles.dueDate, { color: statusColor }]}>
              {isActive ? (isOverdue ? 'Overdue: ' : 'Due: ') : 'Inactive '}
              {new Date(item.next_due).toLocaleDateString()}
            </Text>
          </View>
          
          {isActive && (
            <TouchableOpacity 
              style={[
                styles.payButton, 
                { backgroundColor: markPaidMutation.isPending ? colors.surfaceElevated : colors.primary }
              ]} 
              onPress={() => handleMarkPaid(item)}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle size={16} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.payButtonText}>Mark Paid</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          renderItem={renderBill}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <RefreshCw size={48} color={colors.textSecondary} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recurring bills found.</Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Add one to start tracking subscriptions, rent, etc.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(app)/bills/add')}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 12,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
