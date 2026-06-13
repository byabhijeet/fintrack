import { Stack } from 'expo-router/stack';
import { useAppTheme } from '@/theme';

/**
 * Auth group layout: full-screen stack with no headers.
 * Contains: login, blocked, biometric-setup, biometric-unlock.
 */
export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    />
  );
}
