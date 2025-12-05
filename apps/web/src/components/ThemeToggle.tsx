'use client';

import { useTheme } from '@/theme';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-hover rounded-lg transition-colors duration-350"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {mounted && (theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
    </button>
  );
}
