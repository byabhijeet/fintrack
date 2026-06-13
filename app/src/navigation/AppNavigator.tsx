import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import AddIncomeScreen from '../screens/Home/AddIncomeScreen';
import IncomeHistoryScreen from '../screens/Home/IncomeHistoryScreen';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const session = useAuthStore((state) => state.session);
  const { colors, typography } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
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
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
