'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/theme';
import { useAuth } from '@/lib/auth/useAuth';
import { useState, useEffect } from 'react';

export function Nav() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const getUserInitial = () => {
    if (!user) return '';
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
        scrolled
          ? 'bg-surface/80 backdrop-blur-lg shadow-sm after:absolute'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative h-6">
          <div className="relative flex items-center h-8">
            <Image
              src="/wordmark.svg"
              alt="NIMBL"
              width={70}
              height={20}
              className={`transition-all duration-500 ease-in-out ${
                scrolled 
                  ? 'opacity-0 scale-95 -translate-x-4' 
                  : 'opacity-100 scale-100 translate-x-0'
              }`}
              style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
            />
            <Image
              src="/icon.svg"
              alt="NIMBL"
              width={24}
              height={24}
              className={`absolute left-0 transition-all duration-500 ease-in-out group-hover:scale-105 ${
                scrolled 
                  ? 'opacity-100 scale-100 translate-x-0' 
                  : 'opacity-0 scale-90 -translate-x-4'
              }`}
              style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
            />
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-6">
          <ThemeToggle />
          {user ? (
            <div 
              className="w-8 h-8 rounded-full bg-primary text-surface flex items-center justify-center text-sm font-semibold"
              title={user.email || 'User'}
            >
              {getUserInitial()}
            </div>
          ) : (
            <Link
              href="/forms"
              className="px-4 py-2 bg-primary text-surface rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm sm:text-base"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
