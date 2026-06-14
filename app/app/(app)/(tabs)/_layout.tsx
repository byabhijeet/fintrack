import { Tabs } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { LayoutDashboard, Wallet, ArrowLeftRight, Settings, Receipt } from 'lucide-react-native';
import GlobalFAB from '@/components/boi/GlobalFAB';
import BOIAssistant from '@/components/boi/BOIAssistant';
import { View } from 'react-native';

export default function TabsLayout() {
  const { colors, typography } = useAppTheme();
  const breakpoint = useBreakpoint();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: [
            {
              backgroundColor: colors.surfaceElevated,
              borderTopColor: colors.border,
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
            },
            breakpoint === 'desktop' && { display: 'none' }
          ],
          tabBarLabelStyle: {
            ...typography.labelCaps,
            fontSize: 10,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="credit-book"
          options={{
            title: 'Credit Book',
            tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="split"
          options={{
            title: 'Split',
            tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bills"
          options={{
            title: 'Bills',
            tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="hub"
          options={{
            title: 'Hub',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      <GlobalFAB />
      <BOIAssistant />
    </View>
  );
}
