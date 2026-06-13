import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../theme';
import { authenticate } from '../../services/biometrics';
import { Lock } from 'lucide-react-native';

export default function BiometricUnlockScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const unlockApp = useAuthStore((state) => state.unlockApp);

  const authenticateUser = async () => {
    try {
      const result = await authenticate('Unlock FinTrack');

      if (result.success) {
        unlockApp();
      }
    } catch (error) {
      console.error('Biometric unlock error', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    // Automatically prompt when the screen mounts
    authenticateUser();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, typography.displayLgMobile, { color: colors.textPrimary }]}>
          App Locked
        </Text>
        <Text style={[styles.description, typography.bodyMd, { color: colors.textSecondary }]}>
          Please authenticate to access your financial data.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.pill }]} 
          onPress={authenticateUser}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, typography.labelCaps]}>Unlock</Text>
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
    color: '#000000',
  },
});
