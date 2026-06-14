import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useAppTheme } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalFAB() {
  const { colors, spacing, borderRadius } = useAppTheme();
  const openBOI = useUIStore((state) => state.openBOI);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 80 }]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}
        onPress={openBOI}
        activeOpacity={0.8}
      >
        <Mic size={24} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    zIndex: 9999,
  },
  fab: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
