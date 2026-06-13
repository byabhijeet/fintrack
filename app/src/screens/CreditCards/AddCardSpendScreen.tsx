import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useAddCardSpendMutation } from '../../lib/queries/creditCards';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddCardSpendScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { cardId } = route.params;
  
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [spendDate, setSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const addSpendMutation = useAddCardSpendMutation();

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!merchant) {
      Alert.alert('Missing Merchant', 'Please enter a merchant name.');
      return;
    }
    if (!spendDate) {
      Alert.alert('Missing Date', 'Please enter a spend date.');
      return;
    }

    addSpendMutation.mutate(
      {
        card_id: cardId,
        amount: Number(amount),
        merchant,
        category: category || null,
        spend_date: spendDate,
        notes: notes || null,
        receipt_url: null,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Spend added successfully!');
          navigation.goBack();
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
        <Text style={styles.label}>AMOUNT</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>MERCHANT</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Amazon, Starbucks"
          placeholderTextColor={colors.textMuted}
          value={merchant}
          onChangeText={setMerchant}
        />

        <Text style={styles.label}>CATEGORY (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dining, Travel"
          placeholderTextColor={colors.textMuted}
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>DATE (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-03-15"
          placeholderTextColor={colors.textMuted}
          value={spendDate}
          onChangeText={setSpendDate}
        />

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
          disabled={addSpendMutation.isPending}
        >
          {addSpendMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save Spend</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
