import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import {
  User,
  Settings,
  Bell,
  LayoutGrid,
  LogOut,
  ChevronRight,
  Shield,
  CircleHelp,
  MessageSquare
} from 'lucide-react-native';

export default function MoreScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { signOut, user } = useAuthStore();

  const getPhoneString = () => {
    if (!user || !user.phone) return 'Unknown';
    return user.phone;
  };

  const menuGroups = [
    {
      title: 'Finance',
      items: [
        {
          label: 'Finance Hub',
          icon: <LayoutGrid size={22} color={colors.primary} />,
          href: '/(app)/(tabs)/hub/finance-hub' as const,
          description: 'Rewards, deals & financial instruments'
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Profile',
          icon: <User size={22} color={colors.primary} />,
          href: '/(app)/(tabs)/hub/profile' as const,
          description: 'Personal and address information'
        },
        {
          label: 'Activity',
          icon: <Bell size={22} color={colors.primary} />,
          href: '/(app)/(tabs)/hub/activity' as const,
          description: 'Recent notifications and updates'
        },
        {
          label: 'Settings',
          icon: <Settings size={22} color={colors.primary} />,
          href: '/(app)/(tabs)/hub/settings' as const,
          description: 'App preferences and security'
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Digital Vault',
          icon: <Shield size={22} color={colors.textSecondary} />,
          href: null,
          description: 'Securely store your documents'
        },
        {
          label: 'Help Center',
          icon: <CircleHelp size={22} color={colors.textSecondary} />,
          href: null,
          description: 'FAQs and guides'
        },
        {
          label: 'Contact Us',
          icon: <MessageSquare size={22} color={colors.textSecondary} />,
          href: null,
          description: 'Get in touch with support'
        },
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getPhoneString().substring(1, 3) || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>User</Text>
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{getPhoneString()}</Text>
          </View>
        </View>

        {/* Menu Groups */}
        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary, ...typography.labelCaps }]}>
              {group.title}
            </Text>
            <View style={[styles.menuContainer, { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md }]}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                  onPress={() => item.href && router.push(item.href)}
                  disabled={!item.href}
                >
                  <View style={styles.menuIcon}>
                    {item.icon}
                  </View>
                  <View style={styles.menuTextContent}>
                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                  </View>
                  {item.href && (
                    <ChevronRight size={20} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.border, borderRadius: borderRadius.md }]}
          onPress={signOut}
        >
          <LogOut size={20} color="#FF6B6B" />
          <Text style={[styles.signOutText, { color: '#FF6B6B' }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
