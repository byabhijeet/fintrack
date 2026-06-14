import { View } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAppTheme } from '@/theme';
import Sidebar from '@/components/navigation/Sidebar';
import AppHeader from '@/components/navigation/AppHeader';
import { useHeaderStore } from '@/store/headerStore';

export default function AppLayout() {
  const breakpoint = useBreakpoint();
  const { colors } = useAppTheme();
  const segments = useSegments();
  const { title, rightIcon, onRightPress } = useHeaderStore();

  if (breakpoint === 'desktop') {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        <Sidebar activeSegments={segments} />
        <View style={{ flex: 1 }}>
          <AppHeader
            title={title}
            rightIcon={rightIcon}
            onRightPress={onRightPress ?? undefined}
          />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </View>
    );
  }

  // Mobile layout delegates to (tabs)/_layout.tsx
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
