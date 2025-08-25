'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganizer?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = false,
  requireOrganizer = false,
  requireAdmin = false,
  fallback = null
}: AuthGuardProps) {
  const { user, userProfile, loading, isOrganizer, isAdmin } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !user) {
    if (fallback) return <>{fallback}</>;
    router.push('/login');
    return null;
  }

  // Check organizer requirements
  if (requireOrganizer && !isOrganizer) {
    if (fallback) return <>{fallback}</>;
    router.push('/');
    return null;
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin) {
    if (fallback) return <>{fallback}</>;
    router.push('/');
    return null;
  }

  return <>{children}</>;
}