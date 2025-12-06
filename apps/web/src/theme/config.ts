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
  // Primary (cool graphite)
  primary: '#11181C',
  primaryHover: '#1A2328',
  primaryActive: '#0D151A',

  // Surfaces (clean, modern neutrals w/ slight cool tint)
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F7F9',
  surfaceTertiary: '#ECEEF0',

  // Text (cool gray system)
  text: '#11181C',
  textSecondary: '#687076',
  textTertiary: '#889096',

  // Borders (proper hierarchy)
  border: '#DDE1E3',
  borderSubtle: '#E4E7E9',

  // States (cool-neutrals, not muddy warm grays)
  hover: '#F3F5F7',
  active: '#E9EBED',

  // Semantic (slightly softened, not neon)
  success: '#17B26A',
  warning: '#F5D90A',
  error:   '#E5484D',
  info:    '#0091FF',
};

export const darkTheme: ThemeColors = {
  // Primary (cool, crisp, high-contrast)
  primary: '#ECEDEE',
  primaryHover: '#F5F6F7',
  primaryActive: '#FFFFFF',

  // Surfaces (structured deep neutrals)
  surface: '#111213',            // base background
  surfaceSecondary: '#1A1C1E',   // panels
  surfaceTertiary: '#252729',    // elevated panels

  // Text (cool gray text system)
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  textTertiary: '#6C7278',

  // Borders (correct contrast)
  border: '#2D2F31',
  borderSubtle: '#1F2123',

  // States (cool neutral, not brownish)
  hover: '#2A2C2E',
  active: '#323436',

  // Semantic (dark-mode tuned, slightly softened)
  success: '#30D158',
  warning: '#FFD60A',
  error:   '#FF453A',
  info:    '#0A84FF',
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
