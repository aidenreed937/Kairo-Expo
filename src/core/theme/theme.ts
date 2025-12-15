import { useColorScheme } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: colors.primary[600],
    background: colors.background.light,
    surface: colors.neutral[50],
    text: colors.text.light,
    textSecondary: colors.neutral[500],
    border: colors.neutral[200],
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: colors.primary[400],
    background: colors.background.dark,
    surface: colors.neutral[900],
    text: colors.text.dark,
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
};

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export function getTheme(mode: ThemeMode): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
