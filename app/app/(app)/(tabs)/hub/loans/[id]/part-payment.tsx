import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Alert } from '@/lib/alert';
import { useAppTheme } from '@/theme';
import { useLoan, usePartPayment } from '@/lib/queries/loans';
import { recalculateAmortizationSchedule } from '@/lib/loanMath';

export default function PartPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  
  const { data: loan, isLoading } = useLoan(id as string);
  const partPaymentMutation = usePartPayment();

  const [amountStr, setAmountStr] = useState('');
  const [impactType, setImpactType] = useState<'reduce_emi' | 'reduce_tenure'>('reduce_tenure');
  
  const pendingSchedule = useMemo(() => {
    return loan?.loan_amortisation_schedule?.filter(s => s.status === 'pending') || [];
  }, [loan]);

  const currentOutstanding = pendingSchedule.length > 0 
    ? pendingSchedule[0].closing_balance + pendingSchedule[0].principal_component 
    : 0;

  const amount = Number(amountStr) || 0;

  const recalculation = useMemo(() => {
    if (!loan || amount <= 0 || amount >= currentOutstanding || pendingSchedule.length === 0) return null;
    
    const nextPaymentDate = pendingSchedule[0].emi_month;
    const startingInstallmentNo = pendingSchedule[0].installment_no;
    
    return recalculateAmortizationSchedule(
      currentOutstanding,
      loan.interest_rate,
      loan.emi_amount,
      amount,
      impactType,
      loan.interest_type,
      pendingSchedule.length,
      nextPaymentDate,
      loan.emi_day || 1,
      startingInstallmentNo
    );
  }, [loan, amount, impactType, currentOutstanding, pendingSchedule]);

  if (isLoading || !loan) return null;

  const handleSave = () => {
    if (amount <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid part payment amount.');
    if (amount >= currentOutstanding) return Alert.alert('Invalid Amount', 'Amount must be less than the outstanding principal. Use Foreclose for full payment.');
    if (!recalculation) return;

    partPaymentMutation.mutate({
      loanId: loan.id,
      amount,
      impactType,
      newEmi: recalculation.newEmi,
      newTenureMonths: loan.tenure_months - recalculation.monthsSaved,
      monthsSaved: recalculation.monthsSaved,
      interestSaved: 0,
      outstandingBefore: currentOutstanding,
      outstandingAfter: currentOutstanding - amount,
      newSchedule: recalculation.schedule,
    }, {
      onSuccess: () => {
        router.back();
      },
      onError: (err) => {
        Alert.alert('Error', err.message);
      }
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[typography.title3, { color: colors.text }]}>Part Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Amount (₹)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="numeric"
            placeholder="e.g. 50000"
            placeholderTextColor={colors.textSecondary}
          />

          <View style={styles.infoBox}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Outstanding Principal</Text>
            <Text style={[typography.body, { color: colors.text }]}>₹{Math.round(currentOutstanding).toLocaleString('en-IN')}</Text>
          </View>

          <Text style={[typography.label, { color: colors.text, marginTop: 24, marginBottom: 12 }]}>Impact Type</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor: colors.border },
                impactType === 'reduce_tenure' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setImpactType('reduce_tenure')}
            >
              <Text style={[typography.body, { color: impactType === 'reduce_tenure' ? '#000' : colors.text }]}>Reduce Tenure</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor: colors.border },
                impactType === 'reduce_emi' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setImpactType('reduce_emi')}
            >
              <Text style={[typography.body, { color: impactType === 'reduce_emi' ? '#000' : colors.text }]}>Reduce EMI</Text>
            </TouchableOpacity>
          </View>

          {recalculation && (
            <View style={[styles.previewCard, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[typography.title3, { color: colors.text, marginBottom: 16 }]}>Preview</Text>
              
              <View style={styles.previewRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>New EMI</Text>
                <Text style={[typography.title3, { color: colors.text }]}>₹{Math.round(recalculation.newEmi).toLocaleString('en-IN')}</Text>
              </View>
              
              <View style={styles.previewRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Months Saved</Text>
                <Text style={[typography.title3, { color: colors.success }]}>{recalculation.monthsSaved} mo</Text>
              </View>
              
              <View style={styles.previewRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Remaining Tenure</Text>
                <Text style={[typography.title3, { color: colors.text }]}>{recalculation.newTenureMonths} mo</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: (!recalculation || partPaymentMutation.isPending) ? 0.5 : 1 }]}
            onPress={handleSave}
            disabled={!recalculation || partPaymentMutation.isPending}
          >
            <Text style={[typography.labelCaps, { color: '#000' }]}>
              {partPaymentMutation.isPending ? 'Saving...' : 'Confirm Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollContent: { padding: 24 },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  previewCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});