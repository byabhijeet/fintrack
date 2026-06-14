import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAddBillMutation, useBill, useUpdateBillMutation, useDeleteBillMutation } from '@/lib/queries/bills';
import { useExpenseCategories } from '@/lib/queries/expenses';
import { Trash2 } from 'lucide-react-native';

export default function AddBillScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: bill, isLoading: isLoadingBill } = useBill(id);
  const addBillMutation = useAddBillMutation();
  const updateBillMutation = useUpdateBillMutation();
  const deleteBillMutation = useDeleteBillMutation();
  const { data: categories } = useExpenseCategories();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (bill && !isInitialized) {
      setTitle(bill.title);
      setAmount(bill.amount.toString());
      setFrequency(bill.frequency);
      setCategoryId(bill.category_id || '');
      setNextDue(bill.next_due);
      setIsActive(bill.is_active);
      setIsInitialized(true);
    }
  }, [bill, isInitialized]);

  const handleSubmit = () => {
    if (!title || !amount || !frequency || !nextDue) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const payload = {
      title,
      amount: parseFloat(amount),
      frequency,
      category_id: categoryId || null,
      next_due: nextDue,
      is_active: isActive,
    };

    if (id) {
      updateBillMutation.mutate({
        ...payload,
        id,
      }, {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      });
    } else {
      addBillMutation.mutate({
        ...payload,
        last_run: null,
      }, {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this recurring bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBillMutation.mutate(id, {
              onSuccess: () => {
                router.back();
              },
              onError: (error) => {
                Alert.alert('Error', error.message);
              }
            });
          }
        }
      ]
    );
  };

  if (id && isLoadingBill) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

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
        <View style={styles.buttonRow}>
          {id && (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: '#FF4B4B' }]}
              onPress={handleDelete}
              disabled={deleteBillMutation.isPending}
            >
              {deleteBillMutation.isPending ? (
                <ActivityIndicator color="#FF4B4B" />
              ) : (
                <Trash2 color="#FF4B4B" size={20} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
            onPress={handleSubmit}
            disabled={addBillMutation.isPending || updateBillMutation.isPending}
          >
            {addBillMutation.isPending || updateBillMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{id ? 'Update Bill' : 'Save Bill'}</Text>
            )}
          </TouchableOpacity>
        </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
