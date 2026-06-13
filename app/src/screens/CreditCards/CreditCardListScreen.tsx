import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme';
import { useCreditCards } from '../../lib/queries/creditCards';
import { CreditCard as CreditCardIcon, Plus } from 'lucide-react-native';

export default function CreditCardListScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const navigation = useNavigation<any>();
  const { data: creditCards, isLoading } = useCreditCards();

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => navigation.navigate('CreditCardDetails', { cardId: item.id })}
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
        <Text style={styles.limitLabel}>Limit: ${item.credit_limit?.toLocaleString() ?? 'N/A'}</Text>
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
      ...typography.title,
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCreditCard')}
      >
        <Plus color="#000" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
