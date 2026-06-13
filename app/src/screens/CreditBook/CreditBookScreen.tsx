import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { theme } from '../../theme';

export default function CreditBookScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Credit Book</Text>
        <Text style={styles.subtitle}>P2P Ledgers & Merchant Balances</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Your credit book and sync tools will load here.</Text>
        </View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cardText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
  },
});
