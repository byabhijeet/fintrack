import { Stack, useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { TouchableOpacity, ActionSheetIOS, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';

export default function HomeStackLayout() {
  const { colors } = useAppTheme();
  const router = useRouter();
  
  const breakpoint = useBreakpoint();
  
  const handleAdd = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Add Income', 'Add Expense'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push('/(app)/(tabs)/home/add-income');
          } else if (buttonIndex === 2) {
            router.push('/(app)/(tabs)/home/add-expense');
          }
        }
      );
    } else {
      // For android, we could use a custom modal, but for now we'll route to expense
      router.push('/(app)/(tabs)/home/add-expense');
    }
  };

  return (
    <Stack screenOptions={{ 
      headerShown: breakpoint !== 'desktop', 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={handleAdd} style={{ marginRight: 16 }}>
              <Plus color={colors.textPrimary} size={24} />
            </TouchableOpacity>
          )
        }} 
      />
      <Stack.Screen name="add-income" options={{ presentation: 'modal', title: 'Add Income' }} />
      <Stack.Screen name="add-expense" options={{ presentation: 'modal', title: 'Add Expense' }} />
    </Stack>
  );
}
