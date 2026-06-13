export const theme = {
  colors: {
    background: '#0B0F19', // Premium deep dark slate/navy
    surface: '#151C2C',    // Card and sheet background
    surfaceLight: '#1F293D', // Elevated surface components
    primary: '#6D28D9',    // Royal violet
    primaryLight: '#8B5CF6', // Electric violet
    secondary: '#EC4899',  // Vibrant hot pink
    accent: '#10B981',     // Forest/Emerald green
    textPrimary: '#FFFFFF', // Clean white
    textSecondary: '#94A3B8', // Slate grey
    textMuted: '#64748B',     // Muted slate
    border: '#2A354F',     // Dark slate border
    error: '#EF4444',      // Soft red
    warning: '#F59E0B',    // Amber
    success: '#10B981',    // Success green
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
    round: 9999,
  },
  typography: {
    fontFamily: 'System',
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
  },
};

export type Theme = typeof theme;
