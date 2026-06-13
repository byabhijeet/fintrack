import { Stack } from 'expo-router/stack';
import { useAppTheme } from '@/theme';

export default function CreditCardsLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}
