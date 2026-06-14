import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function CreditBookStackLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();
  
  return (
    <Stack screenOptions={{ 
      headerShown: breakpoint !== 'desktop', 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen name="index" options={{ title: 'Credit Book' }} />
      <Stack.Screen name="party/[id]" options={{ title: 'Party Detail' }} />
      <Stack.Screen name="party/add" options={{ title: 'Add Party' }} />
      <Stack.Screen name="party/[id]/add-transaction" options={{ title: 'Add Transaction' }} />
    </Stack>
  );
}
