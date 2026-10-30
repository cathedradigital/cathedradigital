import React from 'react';
import { useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';
import { AppRoute } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = React.forwardRef<HTMLDivElement, AuthGuardProps>(({ children }, ref) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Login/auth must never be guarded themselves: avoid wrapping the login URL
  // inside another "next" parameter and creating a redirect loop.
  const currentUrl = new URL(
    `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`,
    typeof window !== 'undefined' ? window.location.origin : 'https://cathedradigital.com.br',
  );
  const isAuthRoute = currentUrl.pathname === AppRoute.LOGIN || currentUrl.pathname === '/auth';
  const next = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  const loginUrl = `/auth?next=${encodeURIComponent(next)}`;

  React.useEffect(() => {
    if (!loading && !user && !isAuthRoute && typeof window !== 'undefined') {
      window.location.replace(loginUrl);
    }
  }, [loading, user, isAuthRoute, loginUrl]);

  if (isAuthRoute) return <>{children}</>;

  if (loading || !user) {
    return (
      <div ref={ref} className="flex items-center justify-center min-h-[60vh]">
        <div className="w-spacing-xl h-spacing-xl border-2 border-secondary border-t-transparent rounded-premium animate-spin" />
      </div>
    );
  }

  return <div ref={ref}>{children}</div>;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
