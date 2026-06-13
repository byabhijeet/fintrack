import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useAddCreditCardMutation } from '../../lib/queries/creditCards';
import { useNavigation } from '@react-navigation/native';

export default function AddCreditCardScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const navigation = useNavigation();
  
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');
  const [last4, setLast4] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [billingDay, setBillingDay] = useState('');

  const addCardMutation = useAddCreditCardMutation();

  const handleSave = () => {
    if (!cardName || !bank) {
      Alert.alert('Missing Fields', 'Card Name and Bank are required.');
      return;
    }
    
    const limitNum = creditLimit ? Number(creditLimit) : null;
    const dayNum = billingDay ? Number(billingDay) : null;

    if (dayNum !== null && (dayNum < 1 || dayNum > 31)) {
      Alert.alert('Invalid Billing Day', 'Billing day must be between 1 and 31.');
      return;
    }

    addCardMutation.mutate(
      {
        card_name: cardName,
        bank: bank,
        last4: last4 || null,
        credit_limit: limitNum,
        billing_day: dayNum,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Credit card added successfully!');
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
        <Text style={styles.label}>CARD NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Travel Rewards"
          placeholderTextColor={colors.textMuted}
          value={cardName}
          onChangeText={setCardName}
        />

        <Text style={styles.label}>BANK</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chase"
          placeholderTextColor={colors.textMuted}
          value={bank}
          onChangeText={setBank}
        />

        <Text style={styles.label}>LAST 4 DIGITS (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="1234"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={4}
          value={last4}
          onChangeText={setLast4}
        />

        <Text style={styles.label}>CREDIT LIMIT (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="5000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={creditLimit}
          onChangeText={setCreditLimit}
        />

        <Text style={styles.label}>BILLING DAY (1-31, OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="15"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={2}
          value={billingDay}
          onChangeText={setBillingDay}
        />

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={addCardMutation.isPending}
        >
          {addCardMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save Card</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
