import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function SplitStackLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();
  
  return (
    <Stack screenOptions={{ 
      headerShown: breakpoint !== 'desktop', 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen name="index" options={{ title: 'Split Bill' }} />
      <Stack.Screen name="[id]" options={{ title: 'Group Detail' }} />
      <Stack.Screen name="add-expense" options={{ title: 'Add Expense' }} />
      <Stack.Screen name="settle" options={{ title: 'Settle Up' }} />
    </Stack>
  );
}
