import { lightTheme, darkTheme } from './config';

export function ThemeScript() {
  const lightVars = {
    '--color-primary': lightTheme.primary,
    '--color-primary-hover': lightTheme.primaryHover,
    '--color-primary-active': lightTheme.primaryActive,
    '--color-surface': lightTheme.surface,
    '--color-surface-secondary': lightTheme.surfaceSecondary,
    '--color-surface-tertiary': lightTheme.surfaceTertiary,
    '--color-text': lightTheme.text,
    '--color-text-secondary': lightTheme.textSecondary,
    '--color-text-tertiary': lightTheme.textTertiary,
    '--color-border': lightTheme.border,
    '--color-border-subtle': lightTheme.borderSubtle,
    '--color-hover': lightTheme.hover,
    '--color-active': lightTheme.active,
    '--color-success': lightTheme.success,
    '--color-warning': lightTheme.warning,
    '--color-error': lightTheme.error,
    '--color-info': lightTheme.info,
  };

  const darkVars = {
    '--color-primary': darkTheme.primary,
    '--color-primary-hover': darkTheme.primaryHover,
    '--color-primary-active': darkTheme.primaryActive,
    '--color-surface': darkTheme.surface,
    '--color-surface-secondary': darkTheme.surfaceSecondary,
    '--color-surface-tertiary': darkTheme.surfaceTertiary,
    '--color-text': darkTheme.text,
    '--color-text-secondary': darkTheme.textSecondary,
    '--color-text-tertiary': darkTheme.textTertiary,
    '--color-border': darkTheme.border,
    '--color-border-subtle': darkTheme.borderSubtle,
    '--color-hover': darkTheme.hover,
    '--color-active': darkTheme.active,
    '--color-success': darkTheme.success,
    '--color-warning': darkTheme.warning,
    '--color-error': darkTheme.error,
    '--color-info': darkTheme.info,
  };

  const themeScript = `
    (function() {
      try {
        const saved = localStorage.getItem('theme');
        const theme = (saved === 'light' || saved === 'dark') ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        const lightTheme = ${JSON.stringify(lightVars)};
        const darkTheme = ${JSON.stringify(darkVars)};
        
        const vars = theme === 'dark' ? darkTheme : lightTheme;
        Object.entries(vars).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });
      } catch (e) {
        // Silently fail
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
