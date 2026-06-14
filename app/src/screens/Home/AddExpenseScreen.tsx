import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useExpenseCategories, useAddExpenseMutation } from '../../lib/queries/expenses';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddExpenseScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [amount, setAmount] = useState(params.amount ? String(params.amount) : '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState(params.description ? String(params.description) : '');
  const [notes, setNotes] = useState('');
  const [typeToggle, setTypeToggle] = useState<'expense' | 'outflow'>('expense');

  const { data: categories, isLoading: isCategoriesLoading } = useExpenseCategories();
  const addExpenseMutation = useAddExpenseMutation();

  const filteredCategories = useMemo(() => {
    return categories?.filter(c => c.context === typeToggle) || [];
  }, [categories, typeToggle]);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    addExpenseMutation.mutate(
      {
        amount: Number(amount),
        category_id: selectedCategoryId,
        context: typeToggle,
        entry_date: new Date().toISOString().split('T')[0],
        description: description || null,
        notes: notes || null,
        label: null,
        receipt_url: null,
        tags: [],
        meta: {},
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Entry added successfully!');
          router.back();
        },
        onError: (err) => {
          Alert.alert('Error', err.message);
        },
      }
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.md,
      padding: spacing.xs,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.sm,
    },
    toggleButtonActive: {
      backgroundColor: colors.border,
    },
    toggleText: {
      ...typography.bodySm,
      color: colors.textSecondary,
      fontWeight: typography.weights.semibold,
    },
    toggleTextActive: {
      color: colors.textPrimary,
      fontWeight: typography.weights.bold,
    },
    label: {
      ...typography.labelCaps,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.sizes.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.pill,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.textPrimary,
      ...typography.bodySm,
    },
    chipTextSelected: {
      color: '#000000',
      fontWeight: typography.weights.bold,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.pill,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    },
    saveButtonText: {
      ...typography.bodyMd,
      color: '#000000',
      fontWeight: typography.weights.bold,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, typeToggle === 'expense' && styles.toggleButtonActive]}
            onPress={() => { setTypeToggle('expense'); setSelectedCategoryId(null); }}
          >
            <Text style={[styles.toggleText, typeToggle === 'expense' && styles.toggleTextActive]}>Variable (Expense)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, typeToggle === 'outflow' && styles.toggleButtonActive]}
            onPress={() => { setTypeToggle('outflow'); setSelectedCategoryId(null); }}
          >
            <Text style={[styles.toggleText, typeToggle === 'outflow' && styles.toggleTextActive]}>Fixed (Outflow)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>AMOUNT</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Groceries, Electricity Bill"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>CATEGORY</Text>
        {isCategoriesLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.chipsContainer}>
            <TouchableOpacity
              style={[styles.chip, selectedCategoryId === null && styles.chipSelected]}
              onPress={() => setSelectedCategoryId(null)}
            >
              <Text style={[styles.chipText, selectedCategoryId === null && styles.chipTextSelected]}>
                General
              </Text>
            </TouchableOpacity>
            
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.label}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="Additional details..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={addExpenseMutation.isPending}
        >
          {addExpenseMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save {typeToggle === 'expense' ? 'Expense' : 'Outflow'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
