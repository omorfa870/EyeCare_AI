'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface Props {
  children: ReactNode;
  allowedRoles: ('patient' | 'doctor' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const { user, role, isAuthenticated, isHydrated } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(role as any)) {
      if (role === 'doctor') router.replace('/doctor/dashboard');
      else if (role === 'patient') router.replace('/patient/dashboard');
      else if (role === 'admin') router.replace('/admin/dashboard');
      else router.replace('/');
      return;
    }

    setChecking(false);
  }, [isHydrated, isAuthenticated, user, role, allowedRoles, router]);

  if (!isHydrated || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
