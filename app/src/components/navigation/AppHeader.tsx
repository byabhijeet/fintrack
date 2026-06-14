
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAppTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export default function AppHeader({
  title = 'BillZest FinTrack',
  showBack,
  onBackPress,
  rightIcon,
  onRightPress
}: AppHeaderProps) {
  const { colors, typography } = useAppTheme();
  const insets = useSafeAreaInsets();

  const headerHeight = 64;

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surfaceElevated,
      borderBottomColor: colors.border,
      paddingTop: insets.top,
      height: headerHeight + insets.top,
    }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <ArrowLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={[styles.title, typography.displayLgMobile, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {onRightPress && rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    minWidth: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: -8,
  },
});
