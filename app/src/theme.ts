import { useColorScheme } from 'react-native';

const sharedColors = {
  primary: '#1ED760',
  primaryLight: '#1ED760', // For backward compatibility
  error: '#FFB4AB',
  transparent: 'transparent',
};

export const darkTheme = {
  colors: {
    ...sharedColors,
    background: '#131313',
    surface: '#181818',
    surfaceElevated: '#282828',
    textPrimary: '#E5E2E1',
    textSecondary: '#94A3B8', // Keeping a slate grey for secondary
    textMuted: '#64748B',
    border: '#2A354F',
    inputBackground: '#282828',
  },
};

export const lightTheme = {
  colors: {
    ...sharedColors,
    background: '#FFFFFF',
    surface: '#F6F6F6',
    surfaceElevated: '#EAEAEA',
    textPrimary: '#1C1B1B',
    textSecondary: '#474646',
    textMuted: '#64748B',
    border: '#D1D5DB',
    inputBackground: '#EAEAEA',
  },
};

export const typography = {
  fontFamily: 'Inter', // Assuming Inter is linked/loaded, else fallback to System
  displayLg: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  displayLgMobile: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 33.6, // 28 * 1.2
  },
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  // Added for backward compatibility with old placeholder screens
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 28,
    title: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
  round: 9999, // 50% usually achieved with width/2, but pill is 9999
};

export type ThemeColors = typeof darkTheme.colors;

export const theme = {
  colors: darkTheme.colors,
  typography,
  spacing,
  borderRadius,
};

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || colorScheme === null; // Default to dark

  return {
    isDark,
    colors: isDark ? darkTheme.colors : lightTheme.colors,
    typography,
    spacing,
    borderRadius,
  };
}
