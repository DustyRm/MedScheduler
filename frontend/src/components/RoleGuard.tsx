'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface Props {
  allow: UserRole | UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ allow, children, redirectTo }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = Array.isArray(allow) ? allow : [allow];

  React.useEffect(() => {
    if (!loading && user && !allowed.includes(user.role)) {
      router.replace(redirectTo || (user.role === 1 ? '/paciente' : '/medico'));
    }
  }, [loading, user, allowed, router, redirectTo]);

  if (loading) return <div style={{ padding: 24, opacity: .8 }}>Carregando...</div>;
  if (!user) return null;
  if (!allowed.includes(user.role)) return null;
  return <>{children}</>;
}
