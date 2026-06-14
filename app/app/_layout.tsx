import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionCheck } from '@/lib/queries/subscription';
import { useAppTheme } from '@/theme';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import AlertModal from '@/components/AlertModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Inner component so hooks can run inside the providers.
 */
function AuthGate() {
  const {
    session,
    biometricEnabled,
    biometricSetupComplete,
    isUnlocked,
    init,
  } = useAuthStore();

  const { data: hasValidSubscription, isLoading: isCheckingSubscription } = useSubscriptionCheck();

  const segments = useSegments();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  // Initialise Supabase session + biometric prefs on first mount.
  useEffect(() => {
    init();
  }, [init]);

  // Auth guard: redirect to the correct route whenever auth state changes.
  useEffect(() => {
    // Wait until subscription check resolves before redirecting.
    if (isCheckingSubscription) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // Not logged in → show login
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!hasValidSubscription) {
      // Logged in but no active plan → show blocked screen
      router.replace('/(auth)/blocked');
    } else if (!biometricSetupComplete) {
      // First launch after login → offer biometric setup (native only; web skips automatically)
      router.replace('/(auth)/biometric-setup');
    } else if (biometricEnabled && !isUnlocked) {
      // App re-opened and biometric lock is active
      router.replace('/(auth)/biometric-unlock');
    } else if (inAuthGroup) {
      // All checks passed and still on auth screen → go to app
      router.replace('/(app)/(home)/');
    }
  }, [
    session,
    hasValidSubscription,
    isCheckingSubscription,
    biometricSetupComplete,
    biometricEnabled,
    isUnlocked,
    segments,
  ]);

  // Show a centered spinner while the subscription check is in-flight.
  if (session && isCheckingSubscription) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <AlertModal />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

/**
 * Root layout — wraps the entire app in global providers.
 * NavigationContainer is no longer needed; expo-router provides its own.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
