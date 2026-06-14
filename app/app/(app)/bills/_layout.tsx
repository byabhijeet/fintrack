import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';

export default function BillsLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerStyle: { backgroundColor: colors.surfaceElevated },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="index" options={{ title: 'My Bills' }} />
      <Stack.Screen name="add" options={{ title: 'Add Recurring Bill', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit Bill' }} />
    </Stack>
  );
}
