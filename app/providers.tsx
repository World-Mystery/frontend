'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthInitializer />
      {children}
      <Analytics />
    </ThemeProvider>
  );
}
