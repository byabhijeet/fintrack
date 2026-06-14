
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { useIncomeEntries, useDeleteIncomeMutation, IncomeEntry } from '../../lib/queries/income';

export default function IncomeHistoryScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { data: entries, isLoading, refetch, isRefetching } = useIncomeEntries();
  const deleteMutation = useDeleteIncomeMutation();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Income', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => deleteMutation.mutate(id) 
      }
    ]);
  };

  const renderItem = ({ item }: { item: IncomeEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.finance_categories?.name || 'Income'}</Text>
        </View>
        <Text style={styles.dateText}>{item.entry_date}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.amountText}>+₹{item.amount.toLocaleString('en-IN')}</Text>
          {!!item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
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
      gap: spacing.md,
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    badge: {
      backgroundColor: colors.primary + '20', // 20% opacity
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    badgeText: {
      color: colors.primary,
      ...typography.labelCaps,
    },
    dateText: {
      color: colors.textMuted,
      ...typography.bodySm,
    },
    cardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    amountText: {
      ...typography.displayLg,
      fontSize: 24,
      color: colors.primary,
      lineHeight: 28,
    },
    notesText: {
      color: colors.textSecondary,
      ...typography.bodySm,
      marginTop: spacing.xs,
    },
    deleteButton: {
      padding: spacing.xs,
    },
    deleteText: {
      color: colors.error,
      ...typography.bodySm,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xxl * 2,
    },
    emptyText: {
      color: colors.textSecondary,
      ...typography.bodyMd,
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No income entries found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
