import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useIncomeCategories, useAddIncomeMutation } from '../../lib/queries/income';
import { useRouter } from 'expo-router';

export default function AddIncomeScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: categories, isLoading: isCategoriesLoading } = useIncomeCategories();
  const addIncomeMutation = useAddIncomeMutation();

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Missing Source', 'Please select an income source.');
      return;
    }

    addIncomeMutation.mutate(
      {
        amount: Number(amount),
        source_id: selectedCategoryId,
        entry_date: new Date().toISOString().split('T')[0],
        notes: notes || null,
        meta: {},
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Income added successfully!');
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
    header: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      ...typography.bodyMd,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      marginLeft: spacing.sm,
    },
    content: {
      flex: 1,
      padding: spacing.md,
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
      color: '#000000', // Dark text on primary button
      fontWeight: typography.weights.bold,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.pill,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xl,
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
        <Text style={styles.label}>AMOUNT</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>SOURCE</Text>
        {isCategoriesLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.chipsContainer}>
            {categories?.map((cat) => {
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
          placeholder="e.g. March Salary"
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={addIncomeMutation.isPending}
        >
          {addIncomeMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save Income</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
