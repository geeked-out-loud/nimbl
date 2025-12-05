export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  // Primary - interactive elements, accents
  primary: string;
  primaryHover: string;
  primaryActive: string;

  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Borders & dividers
  border: string;
  borderSubtle: string;

  // Interactive states
  hover: string;
  active: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  // Primary
  primary: '#252627',
  primaryHover: '#3a3a3c',
  primaryActive: '#1a1a1b',

  // Surfaces
  surface: '#f3f2f2',
  surfaceSecondary: '#e8e7e7',
  surfaceTertiary: '#ddd9d9',

  // Text
  text: '#252627',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Borders
  border: '#d1cece',
  borderSubtle: '#e8e7e7',

  // States
  hover: '#eeeded',
  active: '#e0dfdf',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme: ThemeColors = {
  // Primary
  primary: '#e8e7e7',
  primaryHover: '#d1cece',
  primaryActive: '#f3f2f2',

  // Surfaces
  surface: '#1a1a1b',
  surfaceSecondary: '#2a2a2b',
  surfaceTertiary: '#3a3a3c',

  // Text
  text: '#f3f2f2',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',

  // Borders
  border: '#3a3a3c',
  borderSubtle: '#2a2a2b',

  // States
  hover: '#2f2f30',
  active: '#353536',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const themes: Record<ThemeName, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Convert theme object to CSS variables
 */
export function getCSSVariables(themeName: ThemeName): Record<string, string> {
  const theme = themes[themeName];
  return {
    '--color-primary': theme.primary,
    '--color-primary-hover': theme.primaryHover,
    '--color-primary-active': theme.primaryActive,
    '--color-surface': theme.surface,
    '--color-surface-secondary': theme.surfaceSecondary,
    '--color-surface-tertiary': theme.surfaceTertiary,
    '--color-text': theme.text,
    '--color-text-secondary': theme.textSecondary,
    '--color-text-tertiary': theme.textTertiary,
    '--color-border': theme.border,
    '--color-border-subtle': theme.borderSubtle,
    '--color-hover': theme.hover,
    '--color-active': theme.active,
    '--color-success': theme.success,
    '--color-warning': theme.warning,
    '--color-error': theme.error,
    '--color-info': theme.info,
  };
}
