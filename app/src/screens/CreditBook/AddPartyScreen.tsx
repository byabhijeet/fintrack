import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, User, Phone, FileText } from 'lucide-react-native';
import { Alert } from '@/lib/alert';
import { useAppTheme } from '@/theme';
import { useAddPartyMutation } from '@/lib/queries/creditBook';

export default function AddPartyScreen() {
  const { colors, typography } = useAppTheme();
  const router = useRouter();
  const addPartyMutation = useAddPartyMutation();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');

  // Inline validation errors
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; mobile?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    addPartyMutation.mutate(
      { name: name.trim(), mobile: mobile.trim(), notes: notes.trim() || undefined },
      {
        onSuccess: ({ party, isExisting }) => {
          if (isExisting) {
            Alert.alert(
              'Contact Already Exists',
              `${party.name} with mobile ${party.mobile} is already in your credit book.`,
              [
                {
                  text: 'View Contact',
                  onPress: () => {
                    router.replace(`/(app)/(tabs)/credit-book/party/${party.id}`);
                  },
                },
                { text: 'OK', style: 'cancel' },
              ]
            );
          } else {
            router.replace(`/(app)/(tabs)/credit-book/party/${party.id}`);
          }
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message ?? 'Failed to add contact. Please try again.');
        },
      }
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, typography.pageTitle, { color: colors.textPrimary }]}>Add Contact</Text>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>NAME *</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.name ? '#FF4B4B' : colors.border,
                },
              ]}
            >
              <User size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, typography.body, { color: colors.textPrimary }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={[styles.errorText, typography.caption]}>{errors.name}</Text>}
          </View>

          {/* Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>MOBILE NUMBER *</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.mobile ? '#FF4B4B' : colors.border,
                },
              ]}
            >
              <Phone size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.prefix, typography.bodyMedium, { color: colors.textSecondary }]}>+91</Text>
              <TextInput
                style={[styles.input, typography.body, { color: colors.textPrimary }]}
                placeholder="10-digit number"
                placeholderTextColor={colors.textMuted}
                value={mobile}
                onChangeText={(v) => { setMobile(v.replace(/\D/g, '')); setErrors((e) => ({ ...e, mobile: undefined })); }}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
              />
            </View>
            {errors.mobile && <Text style={[styles.errorText, typography.caption]}>{errors.mobile}</Text>}
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, typography.label, { color: colors.textSecondary }]}>NOTES (optional)</Text>
            <View
              style={[
                styles.inputRow,
                styles.textAreaRow,
                { backgroundColor: colors.inputBackground, borderColor: colors.border },
              ]}
            >
              <FileText size={18} color={colors.textSecondary} style={{ marginRight: 10, alignSelf: 'flex-start', marginTop: 2 }} />
              <TextInput
                style={[styles.input, styles.textArea, typography.body, { color: colors.textPrimary }]}
                placeholder="e.g. College friend, shared flat"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: addPartyMutation.isPending ? colors.surfaceElevated : colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={addPartyMutation.isPending}
            activeOpacity={0.85}
          >
            {addPartyMutation.isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={[styles.submitBtnText, typography.label, { color: '#000' }]}>ADD CONTACT</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textAreaRow: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  prefix: {
    marginRight: 6,
  },
  input: {
    flex: 1,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF4B4B',
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    letterSpacing: 1.2,
  },
});