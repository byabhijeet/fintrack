import { Stack } from 'expo-router/stack';
import { useAppTheme } from '@/theme';

export default function CreditBookLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="party/add" />
      <Stack.Screen name="party/[id]" />
      <Stack.Screen name="party/[id]/add-transaction" />
    </Stack>
  );
}

