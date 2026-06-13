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
  ChevronRight
} from 'lucide-react-native';

interface SidebarProps {
  activeSegments: string[];
}

export default function Sidebar({ activeSegments }: SidebarProps) {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { signOut, user } = useAuthStore();

  const isActive = (segment: string) => activeSegments.includes(segment);

  const getPhoneString = () => {
    if (!user || !user.phone) return 'Unknown';
    // Format if possible or just return
    return user.phone;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated, borderRightColor: colors.border }]}>
      {/* Header Logo Area */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoText, { color: '#000' }]}>BZ</Text>
        </View>
        <Text style={[styles.brandName, typography.displayLgMobile, { color: colors.textPrimary }]}>
          BillZest
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SidebarGroup title="DASHBOARD">
          <SidebarItem 
            href="/(app)/(home)" 
            icon={<LayoutDashboard size={20} color={isActive('(home)') ? colors.primary : colors.textSecondary} />} 
            label="Overview" 
            isActive={isActive('(home)')}
          />
          <SidebarItem 
            href="/(app)/(hub)" 
            icon={<Settings size={20} color={isActive('(hub)') ? colors.primary : colors.textSecondary} />} 
            label="Hub" 
            isActive={isActive('(hub)')}
          />
        </SidebarGroup>

        <SidebarGroup title="PERSONAL">
          <SidebarItem 
            href="/(app)/(credit-book)" 
            icon={<Wallet size={20} color={isActive('(credit-book)') ? colors.primary : colors.textSecondary} />} 
            label="Credit Book" 
            isActive={isActive('(credit-book)')}
          />
          <SidebarItem 
            href="/(app)/(split)" 
            icon={<ArrowLeftRight size={20} color={isActive('(split)') ? colors.primary : colors.textSecondary} />} 
            label="Split Expenses" 
            isActive={isActive('(split)')}
          />
          <SidebarItem 
            href="/(app)/credit-cards" 
            icon={<CreditCard size={20} color={isActive('credit-cards') ? colors.primary : colors.textSecondary} />} 
            label="Credit Cards" 
            isActive={isActive('credit-cards')}
          />
        </SidebarGroup>

        <SidebarGroup title="BUSINESS">
          <SidebarItem 
            href="/(app)/business" 
            icon={<Building2 size={20} color={isActive('business') ? colors.primary : colors.textSecondary} />} 
            label="Businesses" 
            isActive={isActive('business')}
          />
          <SidebarItem 
            href="#" 
            icon={<Users size={20} color={colors.textSecondary} />} 
            label="Customers" 
            isActive={false}
          />
        </SidebarGroup>

        {/* Can add more groups as app grows */}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '900',
    fontSize: 16,
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
