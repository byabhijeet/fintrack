import { Stack } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function HubStackLayout() {
  const { colors } = useAppTheme();
  const breakpoint = useBreakpoint();
  
  return (
    <Stack screenOptions={{ 
      headerShown: breakpoint !== 'desktop', 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen name="index" options={{ title: 'Hub' }} />
      <Stack.Screen name="credit-cards" options={{ headerShown: false }} />
      <Stack.Screen name="loans" options={{ headerShown: false }} />
      <Stack.Screen name="business" options={{ headerShown: false }} />
      {/* We will map other directories like vault, rewards, etc. later if added */}
    </Stack>
  );
}
