import { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/lib/alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  MessageCircle,
  Trash2,
} from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import {
  useCreditParties,
  usePartyTransactions,
  useInfinitePartyTransactions,
  useDeleteTransactionMutation,
  PersonalCreditTransaction,
  computeNetBalance,
} from '@/lib/queries/creditBook';

export default function PartyDetailScreen() {
  const { colors, typography } = useAppTheme();
  const router = useRouter();
  const { id: partyId } = useLocalSearchParams<{ id: string }>();
  const { privacyMode } = useUIStore();

  // Fetch data
  const { data: parties = [] } = useCreditParties();
  const party = parties.find((p) => p.id === partyId);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfinitePartyTransactions(partyId ?? '', party?.mobile);
  // We use usePartyTransactions to get the FULL set of transactions for accurate net balance calculation.
  const { data: fullTxns = [] } = usePartyTransactions(partyId ?? '', party?.mobile);
  const deleteTransactionMutation = useDeleteTransactionMutation();

  const txns = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

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

  // Net balance (positive = receivable, negative = payable)
  const net = useMemo(() => computeNetBalance(fullTxns), [fullTxns]);
  const isReceivable = net > 0;
  const isPayable = net < 0;
  const netColor = isReceivable ? '#1ED760' : isPayable ? '#FF4B4B' : colors.textSecondary;

  const fmt = (amount: number) =>
    privacyMode
      ? '***'
      : `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleWhatsApp = () => {
    if (!party) return;
    const msg = encodeURIComponent(
      `Hi ${party.name}, you owe me ₹${Math.abs(net).toFixed(2)}. Please settle when possible. Thanks!`
    );
    const url = `whatsapp://send?phone=91${party.mobile}&text=${msg}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert('WhatsApp not found', 'Please install WhatsApp to send a reminder.');
      })
      .catch(() => Alert.alert('Error', 'Could not open WhatsApp.'));
  };

  const handleDeleteTransaction = (txn: PersonalCreditTransaction) => {
    Alert.alert(
      'Delete Transaction',
      `Delete this ${txn.type === 'gave' ? 'gave' : 'got'} of ${fmt(txn.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteTransactionMutation.mutate({ id: txn.id, partyId: partyId ?? '' }),
        },
      ]
    );
  };

  // ---------------------------------------------------------------------------
  // Render transaction row
  // ---------------------------------------------------------------------------

  const renderTxn = ({ item }: { item: PersonalCreditTransaction }) => {
    const isGave = item.type === 'gave';
    const txnColor = isGave ? '#1ED760' : '#FF4B4B';
    const Icon = isGave ? ArrowUpRight : ArrowDownLeft;
    const prefix = isGave ? '+' : '−';

    return (
      <View style={[styles.txnRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Type icon */}
        <View style={[styles.txnIconWrap, { backgroundColor: `${txnColor}18` }]}>
          <Icon size={20} color={txnColor} />
        </View>

        {/* Details */}
        <View style={styles.txnDetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.txnType, { color: colors.textPrimary }]}>
              {isGave ? 'You lent' : 'You received'}
            </Text>
            {item.is_b2b && (
              <Text style={{ fontSize: 10, color: colors.primary, marginLeft: 6, fontWeight: 'bold' }}> • B2B SYNC</Text>
            )}
          </View>
          {item.note ? (
            <Text style={[styles.txnNote, typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
          <Text style={[styles.txnDate, typography.caption, { color: colors.textSecondary }]}>
            {new Date(item.txn_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Amount + delete */}
        <View style={styles.txnRight}>
          <Text style={[styles.txnAmount, { color: txnColor }]}>
            {prefix} {fmt(item.amount)}
          </Text>
          {!item.is_b2b && (
            <TouchableOpacity
              onPress={() => handleDeleteTransaction(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginTop: 6 }}
            >
              <Trash2 size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: 12 }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.partyName, typography.sectionTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {party?.name ?? 'Party'}
          </Text>
          <Text style={[styles.partyMobile, typography.caption, { color: colors.textSecondary }]}>
            {party?.mobile ? `+91 ${party.mobile}` : ''}
          </Text>
        </View>

        {/* WhatsApp reminder — only when owed */}
        {isReceivable && (
          <TouchableOpacity
            style={[styles.whatsappBtn, { backgroundColor: '#25D366' }]}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <MessageCircle size={16} color="#fff" />
            <Text style={[styles.whatsappBtnText, typography.label, { color: '#fff' }]}>Remind</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Net balance card */}
      <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.balanceLabel, typography.labelCaps, { color: colors.textSecondary }]}>
          {isReceivable
            ? 'They owe you'
            : isPayable
            ? 'You owe them'
            : 'All settled up'}
        </Text>
        <Text style={[styles.balanceAmount, typography.display, { color: netColor }]}>{fmt(Math.abs(net))}</Text>

        {/* Summary chips */}
        <View style={styles.balanceSummaryRow}>
          <View style={styles.summaryChip}>
            <ArrowUpRight size={13} color="#1ED760" />
            <Text style={[styles.summaryChipText, typography.caption, { color: '#1ED760' }]}>
              Gave:{' '}
              {privacyMode
                ? '***'
                : `₹${fullTxns
                    .filter((t) => t.type === 'gave')
                    .reduce((s, t) => s + t.amount, 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Text>
          </View>
          <View style={styles.summaryChip}>
            <ArrowDownLeft size={13} color="#FF4B4B" />
            <Text style={[styles.summaryChipText, typography.caption, { color: '#FF4B4B' }]}>
              Got:{' '}
              {privacyMode
                ? '***'
                : `₹${fullTxns
                    .filter((t) => t.type === 'got')
                    .reduce((s, t) => s + t.amount, 0)
                    .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction list */}
      {isLoading && !isRefetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={txns}
          keyExtractor={(item) => item.id}
          renderItem={renderTxn}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
            <View style={styles.center}>
              <Text style={[styles.emptyTitle, typography.sectionTitle, { color: colors.textPrimary }]}>
                No transactions yet
              </Text>
              <Text style={[styles.emptySubtitle, typography.body, { color: colors.textSecondary }]}>
                Add a gave/got entry using the{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>+</Text>
                {' '}button below.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB — Add Transaction */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() =>
          router.push({
            pathname: '/(app)/(tabs)/credit-book/party/[id]/add-transaction',
            params: { id: partyId, mobile: party?.mobile ?? '' },
          })
        }
        activeOpacity={0.85}
      >
        <Plus color="#000" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  partyName: {
  },
  partyMobile: {
    marginTop: 1,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  whatsappBtnText: {
  },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  balanceAmount: {
    letterSpacing: -1,
    marginBottom: 16,
  },
  balanceSummaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  summaryChipText: {
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnDetails: {
    flex: 1,
  },
  txnType: {
  },
  txnNote: {
    marginTop: 2,
  },
  txnDate: {
    marginTop: 3,
  },
  txnRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txnAmount: {
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});