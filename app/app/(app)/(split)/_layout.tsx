import { Stack } from 'expo-router/stack';
import { useAppTheme } from '@/theme';

export default function SplitLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}
