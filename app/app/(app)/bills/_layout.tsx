import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function BillsLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();

  return (
    <Stack screenOptions={{ 
      headerShown: true, // Re-enable by default to avoid losing it on Add/Edit screens
      headerStyle: { backgroundColor: colors.surfaceElevated },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="index" options={{ title: 'My Bills', headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'Add Recurring Bill', presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit Bill', headerShown: true }} />
    </Stack>
  );
}
