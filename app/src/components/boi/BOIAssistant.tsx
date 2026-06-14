import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Mic, Send, X } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import { parseIntent } from '@/lib/intentParser';
import { useRouter } from 'expo-router';

export default function BOIAssistant() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const router = useRouter();
  const boiOpen = useUIStore((state) => state.boiOpen);
  const closeBOI = useUIStore((state) => state.closeBOI);
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (!inputText.trim()) return;

    const { intent, params } = parseIntent(inputText);

    // Process intent and route
    switch (intent) {
      case 'add_expense':
        router.push({
          pathname: '/(app)/(tabs)/home/add-expense',
          params: { amount: params.amount, description: params.description }
        });
        break;
      case 'add_income':
        router.push({
          pathname: '/(app)/(tabs)/home/add-income',
          params: { amount: params.amount, notes: params.notes }
        });
        break;
      case 'add_credit_got':
      case 'add_credit_gave':
        // Navigating to credit-book root as adding requires picking a party first
        router.push('/(app)/(tabs)/credit-book');
        break;
      case 'add_card_spend':
        // Navigating to credit cards root
        router.push('/(app)/(tabs)/hub/credit-cards');
        break;
      case 'navigate':
        if (params.target && params.target.toLowerCase() === 'loans') {
          router.push('/(app)/(tabs)/hub/loans');
        }
        break;
      default:
        // Handle unknown intent or show a message
        console.log('Unknown intent', params);
        break;
    }

    // Reset and close
    setInputText('');
    closeBOI();
  };

  return (
    <Modal
      visible={boiOpen}
      transparent
      animationType="slide"
      onRequestClose={closeBOI}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeBOI(); }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <View style={[styles.bottomSheet, { backgroundColor: colors.surfaceElevated, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg }]}>

                <View style={styles.header}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>BOI Assistant</Text>
                  <TouchableOpacity onPress={closeBOI} hitSlop={10}>
                    <X size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[typography.bodyMd, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                  Type or say your command (e.g., "Spent 500 on lunch", "Add income 2000 bonus")
                </Text>

                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderRadius: borderRadius.md, borderColor: colors.border }]}>
                  <TouchableOpacity style={styles.micButton}>
                    <Mic size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, typography.bodyMd, { color: colors.textPrimary }]}
                    placeholder="Type here..."
                    placeholderTextColor={colors.textSecondary}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSubmit}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.surface }]}
                    onPress={handleSubmit}
                    disabled={!inputText.trim()}
                  >
                    <Send size={18} color={inputText.trim() ? '#000' : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  bottomSheet: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  micButton: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
