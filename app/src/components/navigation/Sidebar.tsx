
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/theme';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  CreditCard,
  Building2,
  Users,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  TrendingDown,
  Receipt,
  Landmark,
  BookOpen,
  Gift,
  Shield,
  Zap
} from 'lucide-react-native';

interface SidebarProps {
  activeSegments: string[];
}

export default function Sidebar({ activeSegments }: SidebarProps) {
  const { colors, typography, borderRadius } = useAppTheme();
  const { signOut, user } = useAuthStore();

  const isActive = (segment: string) => activeSegments.includes(segment);

  const isOverviewActive = () => isActive('(home)') && !isActive('income-history') && !isActive('expense-history') && !isActive('add-income') && !isActive('add-expense');
  const isIncomeActive = () => isActive('income-history') || isActive('add-income');
  const isExpensesActive = () => isActive('expense-history') || isActive('add-expense');
  const isActivityActive = () => isActive('activity');
  const isBillsActive = () => isActive('bills');
  const isBusinessActive = () => isActive('business');
  const isCardsActive = () => isActive('credit-cards');
  const isLoansActive = () => isActive('loans');
  const isCreditBookActive = () => isActive('(credit-book)');
  const isSplitActive = () => isActive('(split)');
  const isSettingsActive = () => isActive('settings');
  const isHubExtrasActive = () => isActive('(hub)') && !isActive('settings') && !isActive('activity') && !isActive('profile');

  const getPhoneString = () => {
    if (!user || !user.phone) return 'Unknown';
    return user.phone;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated, borderRightColor: colors.border }]}>
      {/* Header Logo Area */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.logoPlaceholder}>
          <Text style={[styles.logoTextB, { color: '#1DB954' }]}>B</Text>
          <Text style={[styles.logoTextZ, { color: '#FFFFFF' }]}>Z</Text>
        </View>
        <Text style={[styles.brandName, typography.displayLgMobile, { color: colors.textPrimary }]}>
          Bill<Text style={{ color: colors.primary }}>Zest</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SidebarGroup title="DASHBOARD">
          <SidebarItem 
            href="/(app)/(tabs)/home" 
            icon={<LayoutDashboard size={20} color={isOverviewActive() ? colors.primary : colors.textSecondary} />} 
            label="Overview" 
            isActive={isOverviewActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/activity" 
            icon={<Bell size={20} color={isActivityActive() ? colors.primary : colors.textSecondary} />} 
            label="Activity" 
            isActive={isActivityActive()}
          />
        </SidebarGroup>

        <SidebarGroup title="PERSONAL">
          <SidebarItem 
            href="/(app)/(tabs)/home/income-history" 
            icon={<TrendingUp size={20} color={isIncomeActive() ? colors.primary : colors.textSecondary} />} 
            label="Income" 
            isActive={isIncomeActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/home/expense-history" 
            icon={<TrendingDown size={20} color={isExpensesActive() ? colors.primary : colors.textSecondary} />} 
            label="Expenses" 
            isActive={isExpensesActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/bills" 
            icon={<Receipt size={20} color={isBillsActive() ? colors.primary : colors.textSecondary} />} 
            label="My Bills" 
            isActive={isBillsActive()}
          />
        </SidebarGroup>

        <SidebarGroup title="BUSINESS">
          <SidebarItem 
            href="/(app)/(tabs)/hub/business" 
            icon={<Building2 size={20} color={isBusinessActive() ? colors.primary : colors.textSecondary} />} 
            label="Business" 
            isActive={isBusinessActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/credit-cards" 
            icon={<CreditCard size={20} color={isCardsActive() ? colors.primary : colors.textSecondary} />} 
            label="Credit Cards" 
            isActive={isCardsActive()}
          />
        </SidebarGroup>

        <SidebarGroup title="LENDING">
          <SidebarItem 
            href="/(app)/(tabs)/hub/loans" 
            icon={<Landmark size={20} color={isLoansActive() ? colors.primary : colors.textSecondary} />} 
            label="Loan Tracker" 
            isActive={isLoansActive()}
          />
        </SidebarGroup>

        <SidebarGroup title="NETWORK">
          <SidebarItem 
            href="/(app)/(tabs)/credit-book" 
            icon={<BookOpen size={20} color={isCreditBookActive() ? colors.primary : colors.textSecondary} />} 
            label="Credit Book" 
            isActive={isCreditBookActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/split" 
            icon={<Users size={20} color={isSplitActive() ? colors.primary : colors.textSecondary} />} 
            label="Expense Split" 
            isActive={isSplitActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/finance-hub"
            icon={<Gift size={20} color={isHubExtrasActive() ? colors.primary : colors.textSecondary} />} 
            label="Refer & Earn" 
            isActive={isHubExtrasActive()}
          />
        </SidebarGroup>

        <SidebarGroup title="TOOLS">
          <SidebarItem 
            href="#" 
            icon={<Shield size={20} color={colors.textSecondary} />} 
            label="Digital Vault" 
            isActive={false}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/finance-hub"
            icon={<Gift size={20} color={isHubExtrasActive() ? colors.primary : colors.textSecondary} />} 
            label="Rewards & Offers" 
            isActive={isHubExtrasActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/finance-hub"
            icon={<Zap size={20} color={isHubExtrasActive() ? colors.primary : colors.textSecondary} />} 
            label="Flash Deals" 
            isActive={isHubExtrasActive()}
          />
          <SidebarItem 
            href="/(app)/(tabs)/hub/settings" 
            icon={<Settings size={20} color={isSettingsActive() ? colors.primary : colors.textSecondary} />} 
            label="Settings" 
            isActive={isSettingsActive()}
          />
        </SidebarGroup>
      </ScrollView>

      {/* Footer User Area */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={[styles.userCard, { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{getPhoneString().substring(1, 3) || 'U'}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, typography.bodySm, { color: colors.textPrimary }]} numberOfLines={1}>
                User
              </Text>
              <Text style={[styles.userPhone, typography.bodySm, { color: colors.textSecondary }]} numberOfLines={1}>
                {getPhoneString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <LogOut size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: '100%',
    borderRightWidth: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextB: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  logoTextZ: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  brandName: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#000',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  userPhone: {},
  logoutBtn: {
    padding: 8,
  },
});
