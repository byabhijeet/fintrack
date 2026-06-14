import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useRewards, useFlashDeals, useUserPoints, useUserRedemptions, usePartnerReferrals, useRedeemRewardMutation, useCreateReferralMutation } from '../../lib/queries/hub';
import { Gift, Zap, Users, Copy, Check, CreditCard, Banknote, Store, Receipt } from 'lucide-react-native';
import { Alert } from '@/lib/alert';

export default function HubScreen() {
  const router = useRouter();
  const { data: rewards, isLoading: rewardsLoading } = useRewards();
  const { data: deals, isLoading: dealsLoading } = useFlashDeals();
  const { data: redemptions } = useUserRedemptions();
  const { data: referrals } = usePartnerReferrals();
  const points = useUserPoints();
  const redeemMutation = useRedeemRewardMutation();
  const referralMutation = useCreateReferralMutation();

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [referralPhone, setReferralPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRedeemReward = async () => {
    if (!selectedReward) return;

    try {
      await redeemMutation.mutateAsync({
        reward_id: selectedReward.id,
        reward_title: selectedReward.title,
        points_spent: selectedReward.points_required,
      });

      Alert.alert('Success', `Reward redeemed! Check your email for the code.`);
      setShowRedeemModal(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Redemption error:', error);
      Alert.alert('Error', 'Failed to redeem reward');
    }
  };

  const handleCreateReferral = async () => {
    if (!referralEmail.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }

    try {
      await referralMutation.mutateAsync({
        referred_email: referralEmail,
        referred_phone: referralPhone.trim() || undefined,
      });

      Alert.alert('Success', 'Referral sent! Your friend will receive an invite.');
      setShowReferralModal(false);
      setReferralEmail('');
      setReferralPhone('');
    } catch (error) {
      console.error('Referral error:', error);
      Alert.alert('Error', 'Failed to send referral');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    // In a real app, use react-native-clipboard
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLoading = rewardsLoading || dealsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Finance Hub</Text>
          <Text style={styles.subtitle}>Rewards, Deals & More</Text>
        </View>

        {/* Financial Instruments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Instruments</Text>
          <View style={styles.instrumentsGrid}>
            <TouchableOpacity style={styles.instrumentCard} onPress={() => router.push('/(app)/(tabs)/hub/credit-cards')}>
              <CreditCard color={theme.colors.primary} size={28} />
              <Text style={styles.instrumentLabel}>Credit Cards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.instrumentCard} onPress={() => router.push('/(app)/(tabs)/hub/loans')}>
              <Banknote color={theme.colors.primary} size={28} />
              <Text style={styles.instrumentLabel}>Loans</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.instrumentCard} onPress={() => router.push('/(app)/(tabs)/hub/business')}>
              <Store color={theme.colors.primary} size={28} />
              <Text style={styles.instrumentLabel}>Business Ledger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.instrumentCard} onPress={() => router.push('/(app)/(tabs)/hub/vault' as any)}>
              <Receipt color={theme.colors.primary} size={28} />
              <Text style={styles.instrumentLabel}>Receipt Vault</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <Text style={styles.pointsLabel}>Available Points</Text>
            <Text style={styles.pointsValue}>{points.total}</Text>
            <Text style={styles.pointsSubtext}>
              {points.lifetime} lifetime • {points.redeemed} redeemed
            </Text>
          </View>
          <View style={styles.pointsIcon}>
            <Gift color="white" size={32} />
          </View>
        </View>

        {/* Flash Deals */}
        {deals && deals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap color={theme.colors.primary} size={20} />
              <Text style={styles.sectionTitle}>Flash Deals</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsScroll}
            >
              {deals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  style={styles.dealCard}
                  onPress={() => deal.deal_url && Linking.openURL(deal.deal_url)}
                >
                  {deal.image_url && (
                    <View style={styles.dealImage} />
                  )}
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    {deal.discount_percentage && (
                      <Text style={styles.dealDiscount}>
                        {deal.discount_percentage}% OFF
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Rewards/Offers */}
        {rewards && rewards.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Gift color={theme.colors.primary} size={20} />
              <Text style={styles.sectionTitle}>Rewards</Text>
            </View>
            <View style={styles.rewardsList}>
              {rewards.slice(0, 5).map((reward) => (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardPartner}>{reward.partner_name || 'Partner'}</Text>
                    <Text style={styles.rewardType}>
                      {reward.store_type === 'online' ? '🌐 Online' : '🏪 Offline'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      points.total < reward.points_required && styles.redeemButtonDisabled,
                    ]}
                    onPress={() => {
                      setSelectedReward(reward);
                      setShowRedeemModal(true);
                    }}
                    disabled={points.total < reward.points_required}
                  >
                    <Text style={styles.redeemButtonText}>
                      {points.total < reward.points_required ? 'Not Eligible' : `${reward.points_required} pts`}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Redemptions */}
        {redemptions && redemptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Redemptions</Text>
            <View style={styles.redemptionsList}>
              {redemptions.slice(0, 3).map((redemption) => (
                <View key={redemption.id} style={styles.redemptionItem}>
                  <View style={styles.redemptionInfo}>
                    <Text style={styles.redemptionTitle}>{redemption.reward_title}</Text>
                    <Text style={styles.redemptionStatus}>{redemption.status}</Text>
                  </View>
                  <Text style={styles.redemptionPoints}>-{redemption.points_spent} pts</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Partner Referral */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color={theme.colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Refer & Earn</Text>
          </View>
          <View style={styles.referralCard}>
            <Text style={styles.referralTitle}>Invite Friends</Text>
            <Text style={styles.referralText}>
              Earn 500 bonus points for every friend who joins
            </Text>
            <TouchableOpacity
              style={styles.referralButton}
              onPress={() => setShowReferralModal(true)}
            >
              <Users color="white" size={18} />
              <Text style={styles.referralButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>

          {/* Active Referrals */}
          {referrals && referrals.length > 0 && (
            <View style={styles.referralsActive}>
              <Text style={styles.referralsTitle}>Active Referrals ({referrals.length})</Text>
              {referrals.slice(0, 3).map((referral) => (
                <View key={referral.id} style={styles.referralItem}>
                  <View style={styles.referralItemInfo}>
                    <Text style={styles.referralItemEmail}>{referral.referred_email}</Text>
                    <Text style={styles.referralItemStatus}>{referral.status}</Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(referral.referral_url || '', referral.id)}>
                    {copiedId === referral.id ? (
                      <Check color="#4ECDC4" size={20} />
                    ) : (
                      <Copy color={theme.colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Redeem Modal */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Redeem Reward</Text>

            {selectedReward && (
              <View style={styles.rewardDetails}>
                <Text style={styles.rewardDetailsTitle}>{selectedReward.title}</Text>
                <Text style={styles.rewardDetailsPartner}>{selectedReward.partner_name}</Text>
                <Text style={styles.rewardDetailsPoints}>
                  Costs: {selectedReward.points_required} points
                </Text>
                {selectedReward.description && (
                  <Text style={styles.rewardDetailsDesc}>{selectedReward.description}</Text>
                )}
                {selectedReward.promo_code && (
                  <View style={styles.promoCode}>
                    <Text style={styles.promoCodeLabel}>Promo Code:</Text>
                    <Text style={styles.promoCodeValue}>{selectedReward.promo_code}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowRedeemModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleRedeemReward}
                disabled={redeemMutation.isPending}
              >
                <Text style={styles.confirmButtonText}>
                  {redeemMutation.isPending ? 'Redeeming...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Referral Modal */}
      <Modal
        visible={showReferralModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friend</Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="friend@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={referralEmail}
              onChangeText={setReferralEmail}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={theme.colors.textSecondary}
              value={referralPhone}
              onChangeText={setReferralPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowReferralModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleCreateReferral}
                disabled={referralMutation.isPending}
              >
                <Text style={styles.confirmButtonText}>
                  {referralMutation.isPending ? 'Sending...' : 'Send Invite'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  instrumentCard: {
    width: '47%',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  instrumentLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
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
  },

  // Points Card
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: theme.spacing.xs,
  },
  pointsValue: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  pointsSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pointsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  // Deals
  dealsScroll: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dealCard: {
    width: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.surfaceElevated,
  },
  dealInfo: {
    padding: theme.spacing.md,
  },
  dealTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  dealDiscount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: '#FF6B6B',
  },

  // Rewards
  rewardsList: {
    gap: theme.spacing.md,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  rewardPartner: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  rewardType: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  redeemButtonDisabled: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  redeemButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: 'white',
    textAlign: 'center',
  },

  // Redemptions
  redemptionsList: {
    gap: theme.spacing.md,
  },
  redemptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  redemptionInfo: {
    flex: 1,
  },
  redemptionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  redemptionStatus: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  redemptionPoints: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: '#FF6B6B',
  },

  // Referral
  referralCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  referralTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  referralText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  referralButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  referralButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  referralsActive: {
    gap: theme.spacing.md,
  },
  referralsTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  referralItemInfo: {
    flex: 1,
  },
  referralItemEmail: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  referralItemStatus: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },

  // Reward Details
  rewardDetails: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  rewardDetailsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  rewardDetailsPartner: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  rewardDetailsPoints: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  rewardDetailsDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  promoCode: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 4,
  },
  promoCodeLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  promoCodeValue: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});