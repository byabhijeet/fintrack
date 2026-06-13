import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';

export default function LoansLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
}
