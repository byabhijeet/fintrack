const sharedColors = {
  primary: '#1ED760',
  primaryLight: '#1ED760', // For backward compatibility
  error: '#FFB4AB',
  success: '#1ED760',
  transparent: 'transparent',
};

/*
export const darkTheme = {
  colors: {
    ...sharedColors,
    background: '#131313',
    surface: '#181818',
    surfaceElevated: '#282828',
    textPrimary: '#E5E2E1',
    textSecondary: '#94A3B8', // Keeping a slate grey for secondary
    textMuted: '#64748B',
    text: '#E5E2E1',
    border: '#2A354F',
    inputBackground: '#282828',
  },
};
*/

export const lightTheme = {
  colors: {
    ...sharedColors,
    background: '#FFFFFF',
    surface: '#F6F6F6',
    surfaceElevated: '#EAEAEA',
    textPrimary: '#1C1B1B',
    textSecondary: '#474646',
    textMuted: '#64748B',
    text: '#1C1B1B',
    border: '#D1D5DB',
    inputBackground: '#EAEAEA',
  },
};

export const typography = {
  // Brand & Headings (Playfair Display)
  display: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  headline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  headlineSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  title2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
  title3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  displaySm: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  displayMd: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  // UI & Body (Inter)
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },

  // Backward compatibility
  fontFamily: 'Inter_400Regular',
  displayLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  displayLgMobile: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 33.6,
  },
  labelCaps: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
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
    medium: '500' as const,
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
  full: 9999,
};

export type ThemeColors = typeof lightTheme.colors;

export const theme = {
  colors: lightTheme.colors,
  typography,
  spacing,
  borderRadius,
};

export function useAppTheme() {
  // We enforce the 'Spotify for Finance' light mode branding uniformly
  // across all devices, ignoring the system light/dark preference.
  const isDark = false;

  return {
    isDark,
    colors: lightTheme.colors,
    typography,
    spacing,
    borderRadius,
  };
}
