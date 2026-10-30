import React from 'react';
import { Navigate, useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';
import { AppRoute } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = React.forwardRef<HTMLDivElement, AuthGuardProps>(({ children }, ref) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Login/auth must never be guarded themselves: doing so wraps the login URL
  // inside another "next" parameter and creates a redirect loop.
  const currentUrl = new URL(
    `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`,
    typeof window !== 'undefined' ? window.location.origin : 'https://cathedradigital.com.br',
  );
  if (currentUrl.pathname === AppRoute.LOGIN || currentUrl.pathname === '/auth') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div ref={ref} className="flex items-center justify-center min-h-[60vh]">
        <div className="w-spacing-xl h-spacing-xl border-2 border-secondary border-t-transparent rounded-premium animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Preserve only the intended internal destination, including query and hash.
    const next = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    const loginPath = `${AppRoute.LOGIN}?next=${encodeURIComponent(next)}`;
    return <Navigate to={loginPath} replace />;
  }

  return <div ref={ref}>{children}</div>;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
