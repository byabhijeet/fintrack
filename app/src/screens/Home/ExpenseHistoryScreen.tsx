import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useExpenseEntries, useDeleteExpenseMutation } from '../../lib/queries/expenses';
import { Trash2 } from 'lucide-react-native';

export default function ExpenseHistoryScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { data: entries, isLoading } = useExpenseEntries();
  const deleteExpenseMutation = useDeleteExpenseMutation();

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No expenses or outflows found.</Text> : null
        }
      />
    </SafeAreaView>
  );
}
