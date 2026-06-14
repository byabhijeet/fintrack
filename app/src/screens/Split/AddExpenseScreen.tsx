import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useAddExpenseMutation, calculatePennyPerfectSplit } from '../../lib/queries/splits';
import { useAuthStore } from '../../store/authStore';
import { Trash2, Plus, ArrowLeft } from 'lucide-react-native';

interface Participant {
  id: string;
  mobile: string;
  splitType: 'equal' | 'percent' | 'exact' | 'shares';
  value: number;
  calculatedShare?: number;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const user = useAuthStore((s) => s.user);
  const addExpenseMutation = useAddExpenseMutation();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [expenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState<'equal' | 'percent' | 'exact' | 'shares'>('equal');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantMobile, setNewParticipantMobile] = useState('');

  const categories = ['Food', 'Travel', 'Accommodation', 'Entertainment', 'Utilities', 'Other'];

  const addParticipant = () => {
    if (!newParticipantMobile.trim()) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }

    const newParticipant: Participant = {
      id: `${Date.now()}`,
      mobile: newParticipantMobile,
      splitType,
      value: splitType === 'equal' ? 1 : 0,
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantMobile('');
    setShowAddParticipant(false);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipantValue = (id: string, value: number) => {
    setParticipants(
      participants.map((p) =>
        p.id === id ? { ...p, value: Math.max(0, value) } : p
      )
    );
  };

  const calculateShares = () => {
    if (!amount || participants.length === 0) return;

    const numAmount = Number(amount);
    const splitCalcs = participants.map((p) => ({
      mobile: p.mobile,
      splitType: p.splitType,
      value: p.value,
    }));

    try {
      const calculated = calculatePennyPerfectSplit(numAmount, splitCalcs);
      const updatedParticipants = participants.map((p) => {
        const calc = calculated.find((c) => c.mobile === p.mobile);
        return {
          ...p,
          calculatedShare: calc?.calculatedShare || 0,
        };
      });
      setParticipants(updatedParticipants);
    } catch (error) {
      console.error('Error calculating shares:', error);
      Alert.alert('Error', 'Invalid split configuration');
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description || participants.length === 0) {
      Alert.alert('Error', 'Please fill all required fields and add at least one participant');
      return;
    }

    if (!user?.id || !groupId) {
      Alert.alert('Error', 'Missing user or group information');
      return;
    }

    try {
      // Recalculate shares before submitting
      const numAmount = Number(amount);
      const splitCalcs = participants.map((p) => ({
        mobile: p.mobile,
        splitType: p.splitType,
        value: p.value,
      }));

      calculatePennyPerfectSplit(numAmount, splitCalcs);

      await addExpenseMutation.mutateAsync({
        group_id: groupId,
        payer_id: user.id,
        amount: numAmount,
        description,
        category,
        expense_date: expenseDate,
        participants: participants.map((p) => {
          let backendSplitType: 'equal' | 'manual' | 'percent' | 'share' | 'itemized' = 'equal';
          if (p.splitType === 'percent') backendSplitType = 'percent';
          else if (p.splitType === 'exact') backendSplitType = 'manual';
          else if (p.splitType === 'shares') backendSplitType = 'share';
          
          return {
            friend_mob: p.mobile,
            split_type: backendSplitType,
            value: p.value,
          };
        }),
      });

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const splitTypeOptions = [
    { label: 'Equal', value: 'equal' as const },
    { label: 'Percent %', value: 'percent' as const },
    { label: 'Exact ₹', value: 'exact' as const },
    { label: 'Shares', value: 'shares' as const },
  ];

  const totalShares = participants.reduce((sum, p) => sum + (p.calculatedShare || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color={theme.colors.textPrimary} size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Add Expense</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.amountPrefix}>₹</Text>
              <TextInput
                style={styles.amountField}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dinner at restaurant"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Split Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Split Type</Text>
            <View style={styles.splitTypeGrid}>
              {splitTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.splitTypeButton,
                    splitType === option.value && styles.splitTypeButtonActive,
                  ]}
                  onPress={() => setSplitType(option.value)}
                >
                  <Text
                    style={[
                      styles.splitTypeButtonText,
                      splitType === option.value && styles.splitTypeButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Participants */}
          <View style={styles.section}>
            <View style={styles.participantHeader}>
              <Text style={styles.label}>Participants</Text>
              <TouchableOpacity
                style={styles.addParticipantButton}
                onPress={() => setShowAddParticipant(true)}
              >
                <Plus color={theme.colors.primary} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.participantsList}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantMobile}>{participant.mobile}</Text>
                    <View style={styles.participantInputRow}>
                      {splitType === 'equal' ? (
                        <Text style={styles.participantValue}>Equal share</Text>
                      ) : (
                        <TextInput
                          style={styles.participantInput}
                          placeholder={
                            splitType === 'percent'
                              ? '0%'
                              : splitType === 'exact'
                              ? '0.00'
                              : '0'
                          }
                          keyboardType="decimal-pad"
                          value={participant.value.toString()}
                          onChangeText={(v) =>
                            updateParticipantValue(participant.id, Number(v) || 0)
                          }
                        />
                      )}
                    </View>
                  </View>
                  <View style={styles.participantShare}>
                    {participant.calculatedShare !== undefined && (
                      <Text style={styles.shareAmount}>
                        ₹{participant.calculatedShare.toFixed(2)}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => removeParticipant(participant.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 color="#FF4B4B" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {participants.length > 0 && (
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={calculateShares}
              >
                <Text style={styles.calculateButtonText}>Calculate Shares</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Summary */}
          {totalShares > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValue}>₹{amount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Allocated:</Text>
                <Text style={[styles.summaryValue, { color: Math.abs(totalShares - Number(amount)) < 0.01 ? '#1ED760' : '#FF4B4B' }]}>
                  ₹{totalShares.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Participants:</Text>
                <Text style={styles.summaryValue}>{participants.length}</Text>
              </View>
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              addExpenseMutation.isPending && styles.addButtonDisabled,
            ]}
            onPress={handleAddExpense}
            disabled={addExpenseMutation.isPending || participants.length === 0}
          >
            <Text style={styles.addButtonText}>
              {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Participant Modal */}
      <Modal
        visible={showAddParticipant}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddParticipant(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Participant</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile number (10 digits)"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="phone-pad"
              value={newParticipantMobile}
              onChangeText={setNewParticipantMobile}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddParticipant(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={addParticipant}
              >
                <Text style={styles.createButtonText}>Add</Text>
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingLeft: theme.spacing.md,
  },
  amountPrefix: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  amountField: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flex: 0.48,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  splitTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  splitTypeButton: {
    flex: 0.48,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  splitTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  splitTypeButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  splitTypeButtonTextActive: {
    color: 'white',
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addParticipantButton: {
    padding: theme.spacing.sm,
  },
  participantsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  participantItem: {
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
  participantInfo: {
    flex: 1,
  },
  participantMobile: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  participantInputRow: {
    flexDirection: 'row',
  },
  participantValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  participantInput: {
    flex: 1,
    maxWidth: 80,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textPrimary,
  },
  participantShare: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  shareAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  calculateButton: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  
  // Modal
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
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  createButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
