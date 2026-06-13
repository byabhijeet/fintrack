import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import {
  useCreditParties,
  usePartyTransactions,
  PersonalCreditParty,
  computeNetBalance,
} from '@/lib/queries/creditBook';

// ---------------------------------------------------------------------------
// Sub-component: PartyRow — fetches its own transactions to compute net balance
// ---------------------------------------------------------------------------

function PartyRow({
  party,
  onPress,
}: {
  party: PersonalCreditParty;
  onPress: () => void;
}) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { privacyMode } = useUIStore();
  const { data: txns = [] } = usePartyTransactions(party.id);

  const net = useMemo(() => computeNetBalance(txns), [txns]);
  const isReceivable = net > 0;
  const isPayable = net < 0;

  const netColor = isReceivable
    ? '#1ED760'
    : isPayable
    ? '#FF4B4B'
    : colors.textSecondary;

  const netLabel = isReceivable ? 'You get back' : isPayable ? 'You owe' : 'Settled';

  const displayNet = privacyMode
    ? '***'
    : `₹${Math.abs(net).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  // Avatar initial
  const initial = party.name.trim()[0]?.toUpperCase() ?? '?';

  return (
    <TouchableOpacity
      style={[styles.partyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar circle */}
      <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.avatarText, typography.sectionTitle, { color: colors.primary }]}>{initial}</Text>
      </View>

      {/* Name + mobile */}
      <View style={styles.partyInfo}>
        <Text style={[styles.partyName, typography.bodyMedium, { color: colors.textPrimary }]} numberOfLines={1}>
          {party.name}
        </Text>
        <Text style={[styles.partyMobile, typography.caption, { color: colors.textSecondary }]}>
          {party.mobile}
        </Text>
      </View>

      {/* Net balance */}
      <View style={styles.netContainer}>
        {net !== 0 && (
          <Text style={[styles.netLabel, typography.labelCaps, { color: netColor }]}>{netLabel}</Text>
        )}
        <Text style={[styles.netAmount, typography.amount, { color: netColor }]}>{displayNet}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function CreditBookListScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const { data: parties = [], isLoading } = useCreditParties();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, typography.display, { color: colors.textPrimary }]}>Credit Book</Text>
        <Text style={[styles.headerSubtitle, typography.body, { color: colors.textSecondary }]}>
          {parties.length} {parties.length === 1 ? 'contact' : 'contacts'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={parties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PartyRow
              party={item}
              onPress={() => router.push(`/(app)/(credit-book)/party/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Users size={56} color={colors.textSecondary} style={{ opacity: 0.35, marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, typography.sectionTitle, { color: colors.textPrimary }]}>
                No credit contacts yet
              </Text>
              <Text style={[styles.emptySubtitle, typography.body, { color: colors.textSecondary }]}>
                Tap the{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>+</Text>
                {' '}button to add a friend or contact and start tracking who owes whom.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => router.push('/(app)/(credit-book)/party/add')}
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
  },
  headerSubtitle: {
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    marginBottom: 2,
  },
  partyMobile: {
  },
  netContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  netLabel: {
    marginBottom: 2,
  },
  netAmount: {
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
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
