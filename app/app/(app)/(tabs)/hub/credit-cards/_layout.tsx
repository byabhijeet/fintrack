import { Stack } from 'expo-router/stack';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function CreditCardsLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();
  return (
    <Stack screenOptions={{ 
      headerShown: breakpoint !== 'desktop', 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen name="index" options={{ title: 'Credit Cards' }} />
      <Stack.Screen name="add" options={{ title: 'Add Card' }} />
    </Stack>
  );
}
