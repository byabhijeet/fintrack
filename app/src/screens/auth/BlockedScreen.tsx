import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../theme';
import { Lock } from 'lucide-react-native';

export default function BlockedScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const signOut = useAuthStore((state) => state.signOut);

  const handleOpenApp = () => {
    Linking.openURL('https://billzest.in'); // Assuming this is the web app URL
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, typography.displayLg, { color: colors.textPrimary }]}>
          Access Denied
        </Text>
        <Text style={[styles.description, typography.bodyMd, { color: colors.textSecondary }]}>
          An active BillZest FinTrack subscription is required to access your data. Please upgrade your plan or ensure your organization has an active subscription.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.pill }]} 
          onPress={handleOpenApp}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, typography.labelCaps]}>Open BillZest App</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, { borderRadius: borderRadius.pill }]} 
          onPress={signOut}
        >
          <Text style={[styles.secondaryButtonText, typography.labelCaps, { color: colors.textSecondary }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#000000', // Hardcoded black for high contrast on neon green
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    // Color set in component
  },
});
