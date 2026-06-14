import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useGroupBalances, useGroupSettlements, useAddSettlementMutation } from '../../lib/queries/splits';
import { useAuthStore } from '../../store/authStore';
import { Send } from 'lucide-react-native';

export default function SettleUpScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const user = useAuthStore((s) => s.user);

  const balances = useGroupBalances(groupId || '');
  const { data: settlements } = useGroupSettlements(groupId || '');
  const settleMutation = useAddSettlementMutation();

  const [selectedDebtorMob, setSelectedDebtorMob] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'CreditBook Wallet'>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  // Calculate outstanding debts
  const outstandingDebts = React.useMemo(() => {
    const debts: Array<{ mob: string; amount: number }> = [];

    Object.entries(balances).forEach(([key, balance]) => {
      if (key.includes(':mobile') && balance < 0) {
        debts.push({
          mob: key.replace(':mobile', ''),
          amount: Math.abs(balance),
        });
      }
    });

    return debts;
  }, [balances]);

  const handleSettle = async () => {
    if (!selectedDebtorMob || !amount.trim() || !user?.id) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await settleMutation.mutateAsync({
        payer_id: user.id,
        receiver_mob: selectedDebtorMob,
        amount: parseFloat(amount),
        method,
        group_id: groupId,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Settlement recorded');
      setSelectedDebtorMob('');
      setAmount('');
      setNotes('');
      setShowModal(false);
    } catch (error) {
      console.error('Settlement error:', error);
      Alert.alert('Error', 'Failed to record settlement');
    }
  };

  const methodOptions: Array<'Cash' | 'UPI' | 'Bank Transfer' | 'CreditBook Wallet'> = [
    'UPI',
    'Cash',
    'Bank Transfer',
    'CreditBook Wallet',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settle Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={outstandingDebts}
        keyExtractor={(item) => item.mob}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Settled</Text>
            <Text style={styles.emptyText}>No outstanding debts in this group</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.debtCard}
            onPress={() => {
              setSelectedDebtorMob(item.mob);
              setAmount(item.amount.toFixed(2));
              setShowModal(true);
            }}
          >
            <View style={styles.debtInfo}>
              <Text style={styles.debtMob}>{item.mob}</Text>
              <Text style={styles.debtLabel}>You owe this amount</Text>
            </View>
            <Text style={styles.debtAmount}>₹{item.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          outstandingDebts.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Outstanding Debts</Text>
              <Text style={styles.sectionSubtitle}>
                Tap a debt to settle it
              </Text>
            </View>
          ) : null
        }
      />

      {settlements && settlements.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Settlements</Text>
          {settlements.slice(0, 3).map((settlement) => (
            <View key={settlement.id} style={styles.settlementItem}>
              <View style={styles.settlementInfo}>
                <Text style={styles.settlementMob}>{settlement.receiver_mob}</Text>
                <Text style={styles.settlementMethod}>{settlement.method}</Text>
              </View>
              <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Settle Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Settlement</Text>

            <View style={styles.formSection}>
              <Text style={styles.label}>To</Text>
              <View style={styles.selectedMob}>
                <Text style={styles.selectedMobText}>{selectedDebtorMob}</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Method</Text>
              <View style={styles.methodGrid}>
                {methodOptions.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodButton,
                      method === m && styles.methodButtonActive,
                    ]}
                    onPress={() => setMethod(m)}
                  >
                    <Text
                      style={[
                        styles.methodButtonText,
                        method === m && styles.methodButtonTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add a note..."
                placeholderTextColor={theme.colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSettle}
                disabled={settleMutation.isPending}
              >
                {settleMutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Send color="white" size={18} />
                    <Text style={styles.submitButtonText}>Mark Settled</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  debtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderColor: '#FF6B6B',
    borderLeftWidth: 4,
  },
  debtInfo: {
    flex: 1,
  },
  debtMob: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  debtLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  debtAmount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: '#FF6B6B',
  },
  recentSection: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    padding: theme.spacing.lg,
  },
  recentTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementMob: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  settlementMethod: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settlementAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: '#4ECDC4',
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
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  selectedMob: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  selectedMobText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  amountInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  methodButton: {
    flex: 0.48,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  methodButtonText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  methodButtonTextActive: {
    color: 'white',
  },
  notesInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
