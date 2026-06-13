import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme';
import { useAddBusinessMutation } from '../../lib/queries/business';

export default function AddBusinessScreen() {
  const router = useRouter();
  const addBusiness = useAddBusinessMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a business name');
      return;
    }

    try {
      await addBusiness.mutateAsync({
        name: name.trim(),
        description: description.trim() || null
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add business');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Business</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. My Bakery"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What does your business do?"
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || addBusiness.isPending}
        >
          {addBusiness.isPending ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>Save Business</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  textArea: {
    minHeight: 100,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
