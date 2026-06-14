
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAppTheme } from '../../theme';
import { useCreditCards } from '../../lib/queries/creditCards';
import { CreditCard as CreditCardIcon, Plus } from 'lucide-react-native';
import AppHeader from '@/components/navigation/AppHeader';

export default function CreditCardListScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const { data: creditCards, isLoading } = useCreditCards();

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => router.push(`/(app)/(tabs)/hub/credit-cards/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardBank}>
          <CreditCardIcon color={colors.textPrimary} size={20} />
          <Text style={styles.bankName}>{item.bank}</Text>
        </View>
        <Text style={styles.last4}>•••• {item.last4 || '****'}</Text>
      </View>
      <Text style={styles.cardName}>{item.card_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.limitLabel}>Limit: ₹{item.credit_limit?.toLocaleString('en-IN') ?? 'N/A'}</Text>
        <Text style={styles.billingDay}>Billing Day: {item.billing_day || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: 100,
    },
    cardItem: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    cardBank: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    bankName: {
      color: colors.textPrimary,
      ...typography.bodyMd,
      fontWeight: typography.weights.semibold,
    },
    last4: {
      color: colors.textSecondary,
      ...typography.bodySm,
    },
    cardName: {
      color: colors.textPrimary,
      ...typography.displayLgMobile,
      marginBottom: spacing.md,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingTop: spacing.sm,
    },
    limitLabel: {
      color: colors.textSecondary,
      ...typography.bodySm,
    },
    billingDay: {
      color: colors.textSecondary,
      ...typography.bodySm,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xxl,
    },
    emptyText: {
      color: colors.textSecondary,
      ...typography.bodyMd,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/hub/credit-cards/add')} style={{ marginRight: spacing.md }}>
              <Plus color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={creditCards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No credit cards found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
