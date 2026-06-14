import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, IndianRupee, FileText } from 'lucide-react-native';
import { Alert } from '@/lib/alert';
import { useAppTheme } from '@/theme';
import { useAddTransactionMutation } from '@/lib/queries/creditBook';

type TxnType = 'gave' | 'got';

export default function AddTransactionScreen() {
  const { colors, typography } = useAppTheme();
  const router = useRouter();
  const { id: partyId, mobile: partyMobile } =
    useLocalSearchParams<{ id: string; mobile: string }>();

  const addTransactionMutation = useAddTransactionMutation();

  const [txnType, setTxnType] = useState<TxnType>('gave');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);

  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});

  const validate = () => {
    const newErrors: { amount?: string; date?: string } = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }
    if (!txnDate) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!partyId || !partyMobile) {
      Alert.alert('Error', 'Missing party information. Please go back and try again.');
      return;
    }

    addTransactionMutation.mutate(
      {
        party_id: partyId,
        counterparty_mob: partyMobile,
        type: txnType,
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        txn_date: txnDate,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message ?? 'Failed to save transaction. Please try again.');
        },
      }
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isGave = txnType === 'gave';
  const accentColor = isGave ? '#FF4B4B' : '#1ED760';

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 12 }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.pageTitle, { color: colors.textPrimary }]}>
            Add Transaction
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Type toggle — Gave / Got */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>TRANSACTION TYPE</Text>
            <View style={[styles.toggle, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              {/* Gave */}
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  isGave && { backgroundColor: '#FF4B4B22' },
                ]}
                onPress={() => setTxnType('gave')}
                activeOpacity={0.7}
              >
                <ArrowUpRight size={18} color={isGave ? '#FF4B4B' : colors.textSecondary} />
                <Text
                  style={[
                    styles.toggleText,
                    typography.label,
                    { color: isGave ? '#FF4B4B' : colors.textSecondary },
                  ]}
                >
                  I Lent (Gave)
                </Text>
              </TouchableOpacity>

              {/* Got */}
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !isGave && { backgroundColor: '#1ED76022' },
                ]}
                onPress={() => setTxnType('got')}
                activeOpacity={0.7}
              >
                <ArrowDownLeft size={18} color={!isGave ? '#1ED760' : colors.textSecondary} />
                <Text
                  style={[
                    styles.toggleText,
                    typography.label,
                    { color: !isGave ? '#1ED760' : colors.textSecondary },
                  ]}
                >
                  I Received (Got)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>AMOUNT *</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.amount ? '#FF4B4B' : accentColor,
                  borderWidth: 1.5,
                },
              ]}
            >
              <IndianRupee size={20} color={accentColor} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.amountInput, typography.amount, { color: accentColor }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={(v) => {
                  setAmount(v.replace(/[^0-9.]/g, ''));
                  setErrors((e) => ({ ...e, amount: undefined }));
                }}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>
            {errors.amount && <Text style={[styles.errorText, typography.caption]}>{errors.amount}</Text>}
          </View>

          {/* Date */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>DATE *</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.date ? '#FF4B4B' : colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, typography.body, { color: colors.textPrimary }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={txnDate}
                onChangeText={(v) => {
                  setTxnDate(v);
                  setErrors((e) => ({ ...e, date: undefined }));
                }}
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="next"
              />
            </View>
            {errors.date && <Text style={[styles.errorText, typography.caption]}>{errors.date}</Text>}
            <Text style={[styles.hint, typography.caption, { color: colors.textSecondary }]}>Format: YYYY-MM-DD</Text>
          </View>

          {/* Note */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>NOTE (optional)</Text>
            <View
              style={[
                styles.inputRow,
                styles.textAreaRow,
                { backgroundColor: colors.inputBackground, borderColor: colors.border },
              ]}
            >
              <FileText size={18} color={colors.textSecondary} style={{ marginRight: 10, alignSelf: 'flex-start', marginTop: 2 }} />
              <TextInput
                style={[styles.input, styles.textArea, typography.body, { color: colors.textPrimary }]}
                placeholder="e.g. Lunch, movie tickets, travel..."
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: addTransactionMutation.isPending
                  ? colors.surfaceElevated
                  : accentColor,
              },
            ]}
            onPress={handleSubmit}
            disabled={addTransactionMutation.isPending}
            activeOpacity={0.85}
          >
            {addTransactionMutation.isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={[styles.submitBtnText, typography.label, { color: '#000' }]}>
                {isGave ? 'RECORD GAVE' : 'RECORD GOT'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 11,
  },
  toggleText: {
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textAreaRow: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  amountInput: {
    flex: 1,
  },
  input: {
    flex: 1,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF4B4B',
    marginTop: 4,
    marginLeft: 4,
  },
  hint: {
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    letterSpacing: 1.2,
  },
});