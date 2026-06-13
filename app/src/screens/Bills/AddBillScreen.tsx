import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { useRouter } from 'expo-router';
import { useAddBillMutation } from '@/lib/queries/bills';
import { useExpenseCategories } from '@/lib/queries/expenses';

export default function AddBillScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  
  const addBillMutation = useAddBillMutation();
  const { data: categories } = useExpenseCategories();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = () => {
    if (!title || !amount || !frequency || !nextDue) {
      alert('Please fill all required fields');
      return;
    }

    addBillMutation.mutate({
      title,
      amount: parseFloat(amount),
      frequency,
      category_id: categoryId || null,
      next_due: nextDue,
      last_run: null,
      is_active: isActive,
    }, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        alert(error.message);
      }
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Bill Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Netflix Subscription"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Amount *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Frequency *</Text>
          <View style={styles.freqRow}>
            {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.freqChip,
                  { borderColor: colors.border },
                  frequency === f && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setFrequency(f as any)}
              >
                <Text style={[
                  styles.freqText,
                  { color: colors.textPrimary },
                  frequency === f && { color: '#fff', fontWeight: 'bold' }
                ]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Next Due Date *</Text>
          {/* Note: Native date picker should be used here, simple text input for MVP */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={nextDue}
            onChangeText={setNextDue}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories?.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  categoryId === cat.id && { borderColor: colors.primary, backgroundColor: 'rgba(30, 215, 96, 0.1)' }
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[
                  styles.catText,
                  { color: colors.textSecondary },
                  categoryId === cat.id && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 4 }]}>Active</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Automatically process this bill when due
            </Text>
          </View>
          <Switch 
            value={isActive} 
            onValueChange={setIsActive}
            trackColor={{ true: colors.primary }}
          />
        </View>

      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={addBillMutation.isPending}
        >
          {addBillMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Bill</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  freqText: {
    fontSize: 14,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  catText: {
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
