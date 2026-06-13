import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useAppTheme } from './src/theme';

const queryClient = new QueryClient();

export default function App() {
  const init = useAuthStore((state) => state.init);
  const { isDark } = useAppTheme();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style={isDark ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
