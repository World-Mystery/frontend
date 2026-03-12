'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';

/**
 * Protected route - redirect to /auth if not logged in.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setAuthed(!!token);
    if (!token) {
      router.replace('/auth');
    }
  }, [router]);

  if (authed !== true) {
    return null; // or render a loading state
  }

  return <>{children}</>;
}

/**
 * Public route - redirect to / if already logged in.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setAuthed(!!token);
    if (token) {
      router.replace('/');
    }
  }, [router]);

  if (authed === true) {
    return null; // redirecting
  }

  if (authed === null) {
    return null; // waiting for token
  }

  return <>{children}</>;
}
