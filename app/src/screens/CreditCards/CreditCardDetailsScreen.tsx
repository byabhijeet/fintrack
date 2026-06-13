import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../../theme';
import { useCreditCards, useCardSpends } from '../../lib/queries/creditCards';
import { Plus } from 'lucide-react-native';

export default function CreditCardDetailsScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const cardId = params.id as string;

  const { data: cards, isLoading: isCardsLoading } = useCreditCards();
  const { data: spends, isLoading: isSpendsLoading } = useCardSpends(cardId);

  const card = cards?.find(c => c.id === cardId);

  // Calculate current cycle dates
  const today = new Date();
  let cycleStart = new Date(today.getFullYear(), today.getMonth(), card?.billing_day || 1);
  if (today < cycleStart) {
    cycleStart.setMonth(cycleStart.getMonth() - 1);
  }

  // Filter spends for the current cycle
  const currentCycleSpends = spends?.filter(s => new Date(s.spend_date) >= cycleStart) || [];
  const currentCycleTotal = currentCycleSpends.reduce((sum, s) => sum + Number(s.amount), 0);

  const utilization = card?.credit_limit 
    ? Math.min((currentCycleTotal / card.credit_limit) * 100, 100) 
    : 0;

  const renderSpend = ({ item }: { item: any }) => (
    <View style={styles.spendItem}>
      <View style={styles.spendLeft}>
        <Text style={styles.merchant}>{item.merchant}</Text>
        <Text style={styles.spendCategory}>{item.category || 'General'}</Text>
        <Text style={styles.spendDate}>{item.spend_date}</Text>
      </View>
      <Text style={styles.amount}>${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: colors.surfaceElevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cardName: {
      ...typography.displayLgMobile,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    bankName: {
      ...typography.bodyMd,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    statsContainer: {
      marginTop: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    statsLabel: {
      ...typography.bodySm,
      color: colors.textSecondary,
    },
    statsValue: {
      ...typography.bodyMd,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: spacing.sm,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: utilization > 80 ? colors.error : colors.primary,
      width: `${utilization}%`,
    },
    listContent: {
      padding: spacing.md,
    },
    sectionTitle: {
      ...typography.displayLgMobile,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
      marginHorizontal: spacing.md,
    },
    spendItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surfaceElevated,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    spendLeft: {
      flex: 1,
    },
    merchant: {
      ...typography.bodyMd,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    spendCategory: {
      ...typography.bodySm,
      color: colors.textSecondary,
    },
    spendDate: {
      ...typography.bodySm,
      color: colors.textMuted,
      marginTop: 2,
    },
    amount: {
      ...typography.bodyMd,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.xl,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
      ...typography.bodyMd,
      marginTop: spacing.xl,
    }
  });

  if (isCardsLoading || isSpendsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Card not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.cardName}>{card.card_name}</Text>
        <Text style={styles.bankName}>{card.bank} •••• {card.last4 || '****'}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Current Cycle Spend</Text>
            <Text style={styles.statsValue}>${currentCycleTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Credit Limit</Text>
            <Text style={styles.statsValue}>
              {card.credit_limit ? `$${card.credit_limit.toLocaleString()}` : 'No Limit'}
            </Text>
          </View>
          {!!card.credit_limit && (
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Spends</Text>
      <FlatList
        data={spends}
        keyExtractor={(item) => item.id}
        renderItem={renderSpend}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No spends recorded yet.</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(app)/credit-cards/[id]/add-spend', params: { id: cardId } })}
      >
        <Plus color="#000" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
