import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme';

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = 'BillZest FinTrack' }: AppHeaderProps) {
  const { colors, typography, spacing } = useAppTheme();

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surfaceElevated,
      borderBottomColor: colors.border
    }]}>
      <Text style={[styles.title, typography.displayLgMobile, { color: colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
});
