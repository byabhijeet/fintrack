import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import AddIncomeScreen from '../screens/Home/AddIncomeScreen';
import IncomeHistoryScreen from '../screens/Home/IncomeHistoryScreen';
import AddExpenseScreen from '../screens/Home/AddExpenseScreen';
import ExpenseHistoryScreen from '../screens/Home/ExpenseHistoryScreen';
import BlockedScreen from '../screens/auth/BlockedScreen';
import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';
import BiometricUnlockScreen from '../screens/auth/BiometricUnlockScreen';
import CreditCardListScreen from '../screens/CreditCards/CreditCardListScreen';
import AddCreditCardScreen from '../screens/CreditCards/AddCreditCardScreen';
import CreditCardDetailsScreen from '../screens/CreditCards/CreditCardDetailsScreen';
import AddCardSpendScreen from '../screens/CreditCards/AddCardSpendScreen';
import BusinessScreen from '../screens/Business/BusinessScreen';
import AddBusinessScreen from '../screens/Business/AddBusinessScreen';
import AddBusinessIncomeScreen from '../screens/Business/AddBusinessIncomeScreen';
import AddBusinessExpenseScreen from '../screens/Business/AddBusinessExpenseScreen';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, hasValidSubscription, isCheckingSubscription, biometricSetupComplete, biometricEnabled, isUnlocked } = useAuthStore();
  const { colors, typography } = useAppTheme();

  if (session && isCheckingSubscription) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !hasValidSubscription ? (
        <Stack.Screen name="Blocked" component={BlockedScreen} />
      ) : !biometricSetupComplete ? (
        <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
      ) : biometricEnabled && !isUnlocked ? (
        <Stack.Screen name="BiometricUnlock" component={BiometricUnlockScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="AddIncome" 
            component={AddIncomeScreen} 
            options={{ 
              headerShown: true, 
              title: 'Add Income',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="IncomeHistory" 
            component={IncomeHistoryScreen} 
            options={{ 
              headerShown: true, 
              title: 'Income History',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ 
              headerShown: true, 
              title: 'Add Expense',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="ExpenseHistory" 
            component={ExpenseHistoryScreen} 
            options={{ 
              headerShown: true, 
              title: 'Expense History',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="CreditCardList" 
            component={CreditCardListScreen} 
            options={{ 
              headerShown: true, 
              title: 'Credit Cards',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="AddCreditCard" 
            component={AddCreditCardScreen} 
            options={{ 
              headerShown: true, 
              title: 'Add Credit Card',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="CreditCardDetails" 
            component={CreditCardDetailsScreen} 
            options={{ 
              headerShown: true, 
              title: 'Card Details',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="AddCardSpend" 
            component={AddCardSpendScreen} 
            options={{ 
              headerShown: true, 
              title: 'Add Spend',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { ...typography.bodyMd, fontWeight: '700' }
            }} 
          />
          <Stack.Screen 
            name="Business" 
            component={BusinessScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AddBusiness" 
            component={AddBusinessScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AddBusinessIncome" 
            component={AddBusinessIncomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AddBusinessExpense" 
            component={AddBusinessExpenseScreen} 
            options={{ headerShown: false }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}
