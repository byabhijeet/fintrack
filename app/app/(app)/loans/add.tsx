import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useAddLoan } from '@/lib/queries/loans';
import { calculateEMI } from '@/lib/loanMath';

const LOAN_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Business Loan', 'Gold Loan', 'Mortgage', 'Other'];

export default function AddLoanScreen() {
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const addLoanMutation = useAddLoan();

  const [form, setForm] = useState({
    lender_name: '',
    loan_type: 'Personal Loan',
    principal_amount: '',
    interest_rate: '',
    interest_type: 'reducing' as 'reducing' | 'flat',
    tenure_months: '',
    start_date: new Date().toISOString().split('T')[0],
    emi_day: '1',
    account_number: '',
    foreclosure_charge_percent: '0',
    notes: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const calculatePreviewEMI = () => {
    const p = parseFloat(form.principal_amount);
    const r = parseFloat(form.interest_rate);
    const t = parseInt(form.tenure_months, 10);
    if (isNaN(p) || isNaN(r) || isNaN(t)) return 0;
    return calculateEMI(p, r, t, form.interest_type);
  };

  const previewEmi = calculatePreviewEMI();

  const handleSave = () => {
    setErrorMsg('');
    const principal = parseFloat(form.principal_amount);
    const rate = parseFloat(form.interest_rate);
    const tenure = parseInt(form.tenure_months, 10);
    const emiDay = parseInt(form.emi_day, 10);

    if (!form.lender_name) return setErrorMsg('Lender name is required');
    if (isNaN(principal) || principal <= 0) return setErrorMsg('Valid principal amount is required');
    if (isNaN(rate) || rate < 0) return setErrorMsg('Valid interest rate is required');
    if (isNaN(tenure) || tenure <= 0) return setErrorMsg('Valid tenure in months is required');
    if (!form.start_date) return setErrorMsg('Start date is required');
    
    addLoanMutation.mutate({
      lender_name: form.lender_name,
      loan_type: form.loan_type,
      principal_amount: principal,
      interest_rate: rate,
      interest_type: form.interest_type,
      tenure_months: tenure,
      start_date: form.start_date,
      emi_day: isNaN(emiDay) ? null : emiDay,
      account_number: form.account_number || null,
      foreclosure_charge_percent: parseFloat(form.foreclosure_charge_percent) || 0,
      notes: form.notes || null,
      emi_amount: previewEmi,
    }, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        setErrorMsg(err.message || 'Failed to add loan');
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[typography.title2, { color: colors.text }]}>Add Loan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {errorMsg ? (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '20' }]}>
            <Text style={[typography.caption, { color: colors.error }]}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Lender Name *</Text>
          <TextInput
            style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. HDFC Bank"
            placeholderTextColor={colors.textSecondary}
            value={form.lender_name}
            onChangeText={(t) => setForm(f => ({ ...f, lender_name: t }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Loan Type *</Text>
          <View style={styles.pillsContainer}>
            {LOAN_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pill,
                  { 
                    backgroundColor: form.loan_type === type ? colors.primary : colors.surface,
                    borderColor: form.loan_type === type ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setForm(f => ({ ...f, loan_type: type }))}
              >
                <Text style={[typography.caption, { color: form.loan_type === type ? '#000' : colors.text }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Principal Amount *</Text>
            <TextInput
              style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={form.principal_amount}
              onChangeText={(t) => setForm(f => ({ ...f, principal_amount: t }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Tenure (Months) *</Text>
            <TextInput
              style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 60"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={form.tenure_months}
              onChangeText={(t) => setForm(f => ({ ...f, tenure_months: t }))}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Interest Rate (% pa) *</Text>
            <TextInput
              style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 10.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={form.interest_rate}
              onChangeText={(t) => setForm(f => ({ ...f, interest_rate: t }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Interest Type *</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { backgroundColor: form.interest_type === 'reducing' ? colors.primary : colors.surface }
                ]}
                onPress={() => setForm(f => ({ ...f, interest_type: 'reducing' }))}
              >
                <Text style={[typography.caption, { color: form.interest_type === 'reducing' ? '#000' : colors.text }]}>Reducing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { backgroundColor: form.interest_type === 'flat' ? colors.primary : colors.surface }
                ]}
                onPress={() => setForm(f => ({ ...f, interest_type: 'flat' }))}
              >
                <Text style={[typography.caption, { color: form.interest_type === 'flat' ? '#000' : colors.text }]}>Flat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.previewBox}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Calculated EMI</Text>
          <Text style={[typography.displayMd, { color: colors.text }]}>₹{Math.round(previewEmi).toLocaleString('en-IN')}/mo</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            This EMI schedule will be auto-generated upon saving.
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Start Date *</Text>
            <TextInput
              style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={form.start_date}
              onChangeText={(t) => setForm(f => ({ ...f, start_date: t }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>EMI Date (1-31)</Text>
            <TextInput
              style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={form.emi_day}
              onChangeText={(t) => setForm(f => ({ ...f, emi_day: t }))}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[typography.labelCaps, { color: colors.textSecondary }]}>Account Number (Optional)</Text>
          <TextInput
            style={[styles.input, typography.body, { color: colors.text, borderColor: colors.border }]}
            placeholder="Loan Account No"
            placeholderTextColor={colors.textSecondary}
            value={form.account_number}
            onChangeText={(t) => setForm(f => ({ ...f, account_number: t }))}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: addLoanMutation.isPending ? 0.7 : 1 }]} 
          onPress={handleSave}
          disabled={addLoanMutation.isPending}
        >
          {addLoanMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[typography.button, { color: '#000' }]}>Save Loan & Generate Schedule</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  scrollContent: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 16 },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 215, 96, 0.1)',
    marginBottom: 20,
    alignItems: 'center',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});
