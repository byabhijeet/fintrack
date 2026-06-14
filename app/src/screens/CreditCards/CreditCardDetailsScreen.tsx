
import { useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../../theme';
import { useCreditCards, useInfiniteCardSpends, useCardSpends } from '../../lib/queries/creditCards';
import { Plus } from 'lucide-react-native';

export default function CreditCardDetailsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const cardId = params.id as string;

  const { data: cards, isLoading: isCardsLoading } = useCreditCards();
  const {
    data,
    isLoading: isSpendsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteCardSpends(cardId);
  // We still use useCardSpends for current cycle total calculation or maybe we should fetch all for stats
  // For now let's just use the infinite one for the list and keep the other for stats if needed,
  // or better, fetch all card spends in a separate query for summary stats.
  const { data: allSpends } = useCardSpends(cardId);

  const card = cards?.find(c => c.id === cardId);

  const spends = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  // Calculate current cycle dates
  const today = new Date();
  let cycleStart = new Date(today.getFullYear(), today.getMonth(), card?.billing_day || 1);
  if (today < cycleStart) {
    cycleStart.setMonth(cycleStart.getMonth() - 1);
  }

  // Filter spends for the current cycle using allSpends to ensure accuracy
  const currentCycleSpends = allSpends?.filter(s => new Date(s.spend_date) >= cycleStart) || [];
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
      <Text style={styles.amount}>₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
    </View>
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={themedStyles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingNextPage, colors.primary, themedStyles.footerLoader]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const themedStyles = styles(useAppTheme(), utilization);

  if (isCardsLoading || (isSpendsLoading && !isRefetching)) {
    return (
      <View style={[themedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={[themedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={themedStyles.emptyText}>Card not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['bottom']}>
      <View style={themedStyles.header}>
        <Text style={themedStyles.cardName}>{card.card_name}</Text>
        <Text style={themedStyles.bankName}>{card.bank} •••• {card.last4 || '****'}</Text>

        <View style={themedStyles.statsContainer}>
          <View style={themedStyles.statsRow}>
            <Text style={themedStyles.statsLabel}>Current Cycle Spend</Text>
            <Text style={themedStyles.statsValue}>₹{currentCycleTotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={themedStyles.statsRow}>
            <Text style={themedStyles.statsLabel}>Credit Limit</Text>
            <Text style={themedStyles.statsValue}>
              {card.credit_limit ? `₹${card.credit_limit.toLocaleString('en-IN')}` : 'No Limit'}
            </Text>
          </View>
          {!!card.credit_limit && (
            <View style={themedStyles.progressBarBg}>
              <View style={themedStyles.progressBarFill} />
            </View>
          )}
        </View>
      </View>

      <Text style={themedStyles.sectionTitle}>Recent Spends</Text>
      <FlatList
        data={spends}
        keyExtractor={(item) => item.id}
        renderItem={renderSpend}
        contentContainerStyle={themedStyles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={themedStyles.emptyText}>No spends recorded yet.</Text>
        }
      />

      <TouchableOpacity
        style={themedStyles.fab}
        onPress={() => router.push({ pathname: '/(app)/credit-cards/[id]/add-spend', params: { id: cardId } })}
      >
        <Plus color="#000" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = ({ colors, typography, spacing, borderRadius }: any, utilization: number) => StyleSheet.create({
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
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
