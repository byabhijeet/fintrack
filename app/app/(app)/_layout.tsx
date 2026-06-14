
import { View } from 'react-native';
import { Tabs, Stack, useSegments } from 'expo-router';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAppTheme } from '@/theme';
import Sidebar from '@/components/navigation/Sidebar';
import AppHeader from '@/components/navigation/AppHeader';
import { LayoutDashboard, Wallet, ArrowLeftRight, Settings } from 'lucide-react-native';

export default function AppLayout() {
  const breakpoint = useBreakpoint();
  const { colors, typography } = useAppTheme();
  const segments = useSegments();

  if (breakpoint === 'desktop') {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        <Sidebar activeSegments={segments} />
        <View style={{ flex: 1 }}>
          <AppHeader title="BillZest" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(home)" />
            <Stack.Screen name="(credit-book)" />
            <Stack.Screen name="(split)" />
            <Stack.Screen name="(hub)" />
            <Stack.Screen name="credit-cards" />
            <Stack.Screen name="business" />
            <Stack.Screen name="loans" />
            <Stack.Screen name="bills" />
          </Stack>
        </View>
      </View>
    );
  }

  // Mobile layout uses Tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...typography.labelCaps,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(credit-book)"
        options={{
          title: 'Credit Book',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(split)"
        options={{
          title: 'Split',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(hub)"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      {/* Hide non-tab screens from tab bar */}
      <Tabs.Screen name="credit-cards" options={{ href: null }} />
      <Tabs.Screen name="business" options={{ href: null }} />
      <Tabs.Screen name="loans" options={{ href: null }} />
      <Tabs.Screen name="bills" options={{ href: null }} />
    </Tabs>
  );
}
