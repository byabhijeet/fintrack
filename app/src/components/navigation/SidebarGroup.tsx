import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme';

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarGroup({ title, children }: SidebarGroupProps) {
  const { colors, typography, spacing } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, typography.labelCaps, { color: colors.textMuted }]}>
        {title}
      </Text>
      <View style={styles.children}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  children: {
    gap: 4,
  },
});
