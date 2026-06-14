
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useLoan, usePayEMI } from '@/lib/queries/loans';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  
  const { data: loan, isLoading } = useLoan(id as string);
  const payEMIMutation = usePayEMI();

  if (isLoading || !loan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handlePayEMI = (scheduleId: string, principal: number, interest: number, total: number) => {
    Alert.alert(
      'Mark EMI as Paid',
      `Are you sure you want to log ₹${total.toLocaleString('en-IN')} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'default',
          onPress: () => {
            payEMIMutation.mutate({
              loanId: loan.id,
              scheduleId,
              amount: total,
              principal,
              interest
            });
          }
        }
      ]
    );
  };

  const schedule = loan.loan_amortisation_schedule || [];
  const paidCount = schedule.filter(s => s.status === 'paid').length;
  const progress = (paidCount / loan.tenure_months) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[typography.title2, { color: colors.text }]}>{loan.lender_name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Principal Amount</Text>
          <Text style={[typography.displayMd, { color: colors.text, marginBottom: 16 }]}>
            ₹{Number(loan.principal_amount).toLocaleString('en-IN')}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>EMI Amount</Text>
              <Text style={[typography.body, { color: colors.text }]}>₹{Math.round(loan.emi_amount).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Interest</Text>
              <Text style={[typography.body, { color: colors.text }]}>{loan.interest_rate}% pa</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[typography.body, { color: colors.text }]}>{loan.interest_type}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Tenure</Text>
              <Text style={[typography.body, { color: colors.text }]}>{paidCount}/{loan.tenure_months} mo</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
            </View>
          </View>

          {loan.status === 'active' && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => router.push(`/loans/${loan.id}/part-payment`)}
              >
                <Text style={[typography.labelCaps, { color: colors.primary }]}>Part Payment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => router.push(`/loans/${loan.id}/foreclose`)}
              >
                <Text style={[typography.labelCaps, { color: colors.error }]}>Foreclose</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={[typography.title3, { color: colors.text, marginBottom: 12, marginTop: 8 }]}>Amortization Schedule</Text>

        <View style={[styles.tableContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 0.5 }]}>#</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1.5 }]}>Date</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>Prin + Int</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>Balance</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 0.5, textAlign: 'center' }]}> </Text>
          </View>

          {schedule.map((row) => {
            const isPaid = row.status === 'paid';
            return (
              <View key={row.id} style={[styles.tableRow, { borderBottomColor: colors.border, opacity: isPaid ? 0.6 : 1 }]}>
                <Text style={[typography.caption, { color: colors.text, flex: 0.5 }]}>{row.installment_no}</Text>
                <Text style={[typography.caption, { color: colors.text, flex: 1.5 }]}>{row.emi_month}</Text>
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <Text style={[typography.caption, { color: colors.text }]}>₹{Math.round(row.principal_component)}</Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>+₹{Math.round(row.interest_component)}</Text>
                </View>
                <Text style={[typography.caption, { color: colors.text, flex: 1.5, textAlign: 'right' }]}>
                  ₹{Math.round(row.closing_balance).toLocaleString('en-IN')}
                </Text>
                <TouchableOpacity 
                  style={{ flex: 0.5, alignItems: 'center' }}
                  onPress={() => {
                    if (!isPaid) {
                      handlePayEMI(
                        row.id, 
                        Number(row.principal_component), 
                        Number(row.interest_component), 
                        Number(row.principal_component) + Number(row.interest_component)
                      );
                    }
                  }}
                  disabled={isPaid || payEMIMutation.isPending}
                >
                  {isPaid ? (
                    <CheckCircle2 color={colors.success} size={20} />
                  ) : (
                    <Circle color={colors.border} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginLeft: -8 },
  scrollContent: { padding: 16 },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    rowGap: 20,
  },
  infoCol: {
    minWidth: '40%',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
});
