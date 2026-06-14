import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import { useProfile, useAddress, useUpdateProfileMutation, useUpdateAddressMutation } from '../../../lib/queries/profile';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: address, isLoading: isAddressLoading } = useAddress();

  const updateProfileMutation = useUpdateProfileMutation();
  const updateAddressMutation = useUpdateAddressMutation();

  const [fullName, setFullName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUpiId(profile.upi_id || '');
    }
  }, [profile]);

  useEffect(() => {
    if (address) {
      setAddressLine1(address.line1 || '');
      setCity(address.city || '');
      setState(address.state || '');
      setPincode(address.pincode || '');
    }
  }, [address]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName,
        upi_id: upiId,
      });

      if (addressLine1 || city || state || pincode) {
        await updateAddressMutation.mutateAsync({
          line1: addressLine1,
          city,
          state,
          pincode,
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (isProfileLoading || isAddressLoading) {
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateProfileMutation.isPending || updateAddressMutation.isPending}
        >
          {updateProfileMutation.isPending || updateAddressMutation.isPending ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Save size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>UPI ID</Text>
          <TextInput
            style={styles.input}
            value={upiId}
            onChangeText={setUpiId}
            placeholder="yourname@bank"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Address Info</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Line 1</Text>
          <TextInput
            style={styles.input}
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Street address"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="State"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pincode"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
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
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
});
