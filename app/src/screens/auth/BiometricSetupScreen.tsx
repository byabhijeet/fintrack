import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../theme';
import { checkAvailable, authenticate } from '../../services/biometrics';
import { ShieldCheck } from 'lucide-react-native';

export default function BiometricSetupScreen() {
  const { colors, typography, borderRadius } = useAppTheme();
  const { enableBiometric, skipBiometricSetup } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const isAvailable = await checkAvailable();
      setIsSupported(isAvailable);
      
      if (!isAvailable) {
        // If device doesn't support it, just skip automatically
        skipBiometricSetup();
      }
    })();
  }, [skipBiometricSetup]);

  const handleEnable = async () => {
    try {
      const result = await authenticate('Enable Biometric Authentication');

      if (result.success) {
        await enableBiometric();
      } else {
        Alert.alert('Authentication Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Biometric auth error', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  if (!isSupported) {
    return null; // Don't render anything if we're auto-skipping
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={64} color={colors.primary} />
        </View>
        <Text style={[styles.title, typography.displayLgMobile, { color: colors.textPrimary }]}>
          Secure Your App
        </Text>
        <Text style={[styles.description, typography.bodyMd, { color: colors.textSecondary }]}>
          Enable Face ID or Touch ID for faster and more secure access to your financial data.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: borderRadius.pill }]} 
          onPress={handleEnable}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, typography.labelCaps]}>Enable Biometrics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, { borderRadius: borderRadius.pill }]} 
          onPress={skipBiometricSetup}
        >
          <Text style={[styles.secondaryButtonText, typography.labelCaps, { color: colors.textSecondary }]}>Skip For Now</Text>
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
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {},
});
