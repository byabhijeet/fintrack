
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Building2 } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useLoans } from '@/lib/queries/loans';
import AppHeader from '@/components/navigation/AppHeader';

export default function LoansScreen() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const { data: loans, isLoading } = useLoans();

  const totalOutstanding = loans?.reduce((acc, loan) => {
    if (loan.status !== 'active') return acc;
    // For simplicity without calculating live outstanding here, we just show principal
    return acc + Number(loan.principal_amount);
  }, 0) || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Loans"
        showBack={true}
        onBackPress={() => router.back()}
        onRightPress={() => router.push('/loans/add')}
        rightIcon={<Plus color={colors.primary} size={24} />}
      />

      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Total Active Principal</Text>
        <Text style={[typography.displayLg, { color: colors.text }]}>₹{totalOutstanding.toLocaleString('en-IN')}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.loanCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/loans/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.loanCardHeader}>
                <View style={styles.lenderInfo}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                    <Building2 color={colors.primary} size={20} />
                  </View>
                  <View>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{item.lender_name}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.loan_type}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={[typography.caption, { color: item.status === 'active' ? colors.success : colors.textSecondary }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.loanCardBody, { borderTopColor: colors.border }]}>
                <View style={styles.infoRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Principal</Text>
                  <Text style={[typography.body, { color: colors.text }]}>₹{Number(item.principal_amount).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>EMI</Text>
                  <Text style={[typography.body, { color: colors.text }]}>₹{Number(item.emi_amount).toLocaleString('en-IN')}/mo</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Interest</Text>
                  <Text style={[typography.body, { color: colors.text }]}>{item.interest_rate}% {item.interest_type}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>No loans found. Add one to track EMIs.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listContainer: { padding: 16, paddingBottom: 100 },
  loanCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  lenderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  loanCardBody: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRow: {
    alignItems: 'flex-start',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { padding: 32, alignItems: 'center' },
});
