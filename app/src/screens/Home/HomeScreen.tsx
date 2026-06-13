import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { theme } from '../../theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back to BillZest Finance</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Finance data overview will appear here.</Text>
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
