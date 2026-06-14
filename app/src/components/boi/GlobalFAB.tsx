import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';

export default function GlobalFAB() {
  const { colors, spacing, borderRadius } = useAppTheme();
  const openBOI = useUIStore((state) => state.openBOI);
  
  // In Expo Router v3/SDK 56, we can't use @react-navigation/bottom-tabs.
  // We use the safe area inset + the standard tab bar height (usually ~64px).
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + 64;

  return (
    <View style={[styles.container, { bottom: tabBarHeight + 16 }]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
        onPress={openBOI}
        activeOpacity={0.8}
      >
        <Mic color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
});
