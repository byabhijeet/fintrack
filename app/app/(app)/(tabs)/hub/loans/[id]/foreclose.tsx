import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Alert } from '@/lib/alert';
import { useAppTheme } from '@/theme';
import { useLoan, useForeclosure } from '@/lib/queries/loans';

export default function ForecloseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  
  const { data: loan, isLoading } = useLoan(id as string);
  const foreclosureMutation = useForeclosure();

  const [chargePctStr, setChargePctStr] = useState(loan?.foreclosure_charge_percent?.toString() || '0');
  
  const pendingSchedule = useMemo(() => {
    return loan?.loan_amortisation_schedule?.filter(s => s.status === 'pending') || [];
  }, [loan]);

  const currentOutstanding = pendingSchedule.length > 0 
    ? pendingSchedule[0].closing_balance + pendingSchedule[0].principal_component 
    : 0;

  const chargePct = Number(chargePctStr) || 0;
  const chargeAmount = (currentOutstanding * chargePct) / 100;
  const totalPayable = currentOutstanding + chargeAmount;

  if (isLoading || !loan) return null;

  const handleSave = () => {
    if (chargePct < 0) return Alert.alert('Invalid Charge', 'Charge percentage cannot be negative.');

    Alert.alert(
      'Confirm Foreclosure',
      `Are you sure you want to foreclose this loan? You will be recording a final payment of ₹${Math.round(totalPayable).toLocaleString('en-IN')}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            foreclosureMutation.mutate({
              loanId: loan.id,
              outstandingPrincipal: currentOutstanding,
              foreclosureChargePct: chargePct,
              foreclosureChargeType: 'percentage',
              foreclosureChargeAmount: chargeAmount,
              totalPayable,
              interestSaved: 0,
            }, {
              onSuccess: () => {
                router.back();
              },
              onError: (err) => {
                Alert.alert('Error', err.message);
              }
            });
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[typography.title3, { color: colors.text }]}>Foreclose Loan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Outstanding Principal</Text>
            <Text style={[typography.displaySm, { color: colors.text }]}>₹{Math.round(currentOutstanding).toLocaleString('en-IN')}</Text>
          </View>

          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8, marginTop: 32 }]}>Foreclosure Charge (%)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={chargePctStr}
            onChangeText={setChargePctStr}
            keyboardType="numeric"
            placeholder="e.g. 2.5"
            placeholderTextColor={colors.textSecondary}
          />

          <View style={[styles.previewCard, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[typography.title3, { color: colors.text, marginBottom: 16 }]}>Breakdown</Text>
            
            <View style={styles.previewRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Principal Amount</Text>
              <Text style={[typography.body, { color: colors.text }]}>₹{Math.round(currentOutstanding).toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={styles.previewRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Foreclosure Charge</Text>
              <Text style={[typography.body, { color: colors.error }]}>+ ₹{Math.round(chargeAmount).toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={[styles.previewRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 }]}>
              <Text style={[typography.title3, { color: colors.text }]}>Total Payable</Text>
              <Text style={[typography.title2, { color: colors.text }]}>₹{Math.round(totalPayable).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.error, opacity: foreclosureMutation.isPending ? 0.5 : 1 }]}
            onPress={handleSave}
            disabled={foreclosureMutation.isPending}
          >
            <Text style={[typography.labelCaps, { color: '#fff' }]}>
              {foreclosureMutation.isPending ? 'Processing...' : 'Confirm Foreclosure'}
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
  infoBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
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