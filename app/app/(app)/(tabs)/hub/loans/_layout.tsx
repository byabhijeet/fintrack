import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function LoansLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();

  return (
    <Stack
      screenOptions={{
        headerShown: breakpoint !== 'desktop',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Loans' }} />
      <Stack.Screen name="add" options={{ title: 'Add Loan' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Loan Details' }} />
    </Stack>
  );
}
