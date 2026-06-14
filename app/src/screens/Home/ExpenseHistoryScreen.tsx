import { useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useInfiniteExpenseEntries, useDeleteExpenseMutation } from '../../lib/queries/expenses';
import { Trash2 } from 'lucide-react-native';
import { Alert } from '@/lib/alert';

export default function ExpenseHistoryScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(useAppTheme());
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteExpenseEntries();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  const entries = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => deleteExpenseMutation.mutate(id)
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {item.finance_categories?.name || 'Uncategorized'}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.descriptionText}>
            {item.description || (item.context === 'expense' ? 'Expense' : 'Fixed Outflow')}
          </Text>
          {!!item.notes && (
            <Text style={styles.notesText}>{item.notes}</Text>
          )}
        </View>
        <Text style={styles.amountText}>
          ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.contextText}>{item.context.toUpperCase()}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          disabled={deleteExpenseMutation.isPending}
        >
          <Trash2 color={colors.error} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingNextPage, colors.primary]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading && !isRefetching ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
            <Text style={styles.emptyText}>No expenses or outflows found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = ({ colors, typography, spacing, borderRadius }: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  dateText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  notesText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  amountText: {
    ...typography.bodyMd,
    color: '#FF4B4B', // Standard red for expenses/outflows, can use colors.error if preferred
    fontWeight: typography.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  contextText: {
    ...typography.labelCaps,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  }
});
