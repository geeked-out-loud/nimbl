export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const saved = localStorage.getItem('theme');
        const theme = (saved === 'light' || saved === 'dark') ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        const lightTheme = {
          '--color-primary': '#252627',
          '--color-primary-hover': '#3a3a3c',
          '--color-primary-active': '#1a1a1b',
          '--color-surface': '#f3f2f2',
          '--color-surface-secondary': '#e8e7e7',
          '--color-surface-tertiary': '#ddd9d9',
          '--color-text': '#252627',
          '--color-text-secondary': '#666666',
          '--color-text-tertiary': '#999999',
          '--color-border': '#d1cece',
          '--color-border-subtle': '#e8e7e7',
          '--color-hover': '#eeeded',
          '--color-active': '#e0dfdf',
          '--color-success': '#10b981',
          '--color-warning': '#f59e0b',
          '--color-error': '#ef4444',
          '--color-info': '#3b82f6',
        };
        
        const darkTheme = {
          '--color-primary': '#e8e7e7',
          '--color-primary-hover': '#d1cece',
          '--color-primary-active': '#f3f2f2',
          '--color-surface': '#1a1a1b',
          '--color-surface-secondary': '#2a2a2b',
          '--color-surface-tertiary': '#3a3a3c',
          '--color-text': '#f3f2f2',
          '--color-text-secondary': '#b0b0b0',
          '--color-text-tertiary': '#808080',
          '--color-border': '#3a3a3c',
          '--color-border-subtle': '#2a2a2b',
          '--color-hover': '#2f2f30',
          '--color-active': '#353536',
          '--color-success': '#10b981',
          '--color-warning': '#f59e0b',
          '--color-error': '#ef4444',
          '--color-info': '#3b82f6',
        };
        
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
