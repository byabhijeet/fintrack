import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import { useAccountConsents, useUpdateConsentsMutation, UpdateConsentsInput } from '../../../lib/queries/settings';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { ArrowLeft, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const { data: consents, isLoading } = useAccountConsents();
  const updateConsentsMutation = useUpdateConsentsMutation();

  const { privacyMode, togglePrivacyMode } = useUIStore();
  const { biometricEnabled, enableBiometric, disableBiometric, signOut } = useAuthStore();

  const handleConsentToggle = async (key: keyof UpdateConsentsInput, value: boolean) => {
    try {
      await updateConsentsMutation.mutateAsync({ [key]: value });
    } catch (error) {
      console.error('Failed to update consent:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        signOut();
        router.replace('/');
      }},
    ]);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      await enableBiometric();
      Alert.alert('Biometrics Enabled', 'You can now use biometrics to unlock the app.');
    } else {
      await disableBiometric();
      Alert.alert('Biometrics Disabled', 'Biometric unlock has been disabled.');
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Privacy Mode</Text>
            <Text style={styles.settingDescription}>Mask sensitive amounts on screen</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={togglePrivacyMode}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Biometric Unlock</Text>
              <Text style={styles.settingDescription}>Require Touch/Face ID to open app</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={'#fff'}
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Communications & Privacy</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Email Updates</Text>
            <Text style={styles.settingDescription}>Receive updates via email</Text>
          </View>
          <Switch
            value={consents?.email_opt_in ?? false}
            onValueChange={(val) => handleConsentToggle('email_opt_in', val)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>SMS Updates</Text>
            <Text style={styles.settingDescription}>Receive important alerts via SMS</Text>
          </View>
          <Switch
            value={consents?.sms_opt_in ?? false}
            onValueChange={(val) => handleConsentToggle('sms_opt_in', val)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>WhatsApp Notifications</Text>
            <Text style={styles.settingDescription}>Get updates on WhatsApp</Text>
          </View>
          <Switch
            value={consents?.whatsapp_opt_in ?? false}
            onValueChange={(val) => handleConsentToggle('whatsapp_opt_in', val)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Marketing Promos</Text>
            <Text style={styles.settingDescription}>Offers and promotional content</Text>
          </View>
          <Switch
            value={consents?.marketing_consent ?? false}
            onValueChange={(val) => handleConsentToggle('marketing_consent', val)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Data Processing</Text>
            <Text style={styles.settingDescription}>Allow AI features using your data</Text>
          </View>
          <Switch
            value={consents?.data_processing_consent ?? false}
            onValueChange={(val) => handleConsentToggle('data_processing_consent', val)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    ...theme.typography.headlineSmall,
    color: theme.colors.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  settingDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutText: {
    ...theme.typography.label,
    color: theme.colors.error,
    marginLeft: 8,
  },
});
