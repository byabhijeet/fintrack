import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useAppTheme } from '@/theme';

interface SidebarItemProps {
  href: any;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

export default function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  const { colors, typography, borderRadius } = useAppTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} asChild>
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={StyleSheet.flatten([
          styles.container,
          { borderRadius: borderRadius.md },
          isActive && { backgroundColor: colors.primary + '1A' }, // 10% opacity primary
          !isActive && isHovered && { backgroundColor: colors.surfaceElevated },
        ])}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, isActive && { opacity: 1 }]}>
            {icon}
          </View>
          <Text
            style={[
              styles.label,
              typography.bodyMd,
              { color: isActive ? colors.primary : colors.textSecondary },
              isActive && { fontWeight: '600' }
            ]}
          >
            {label}
          </Text>
        </View>
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: colors.primary, borderTopLeftRadius: borderRadius.sm, borderBottomLeftRadius: borderRadius.sm }]} />
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    opacity: 0.7,
  },
  label: {
  },
  activeIndicator: {
    width: 4,
    height: 24,
    position: 'absolute',
    right: -8, // to counter marginHorizontal of container and touch edge
  },
});
