import React from 'react';
import { Navigate, useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = React.forwardRef<HTMLDivElement, AuthGuardProps>(({ children }, ref) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div ref={ref} className="flex items-center justify-center min-h-[60vh]">
        <div className="w-spacing-xl h-spacing-xl border-2 border-secondary border-t-transparent rounded-premium animate-spin" />
      </div>
    );
  }

  if (!user) {
    // AnimatePresence can keep the outgoing protected route mounted briefly after
    // the URL has already changed. Do not let that stale guard wrap the canonical
    // auth URL inside another `next` parameter during the exit transition.
    if (location.pathname === '/auth' || location.pathname === '/login') return null;

    // Redirect directly to the canonical auth route. The /login alias is public,
    // but its extra client-side navigation can race the outgoing protected route
    // and wrap the original destination inside another next parameter.
    const next = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
    const authPath = `/auth?next=${encodeURIComponent(next)}`;
    return <Navigate to={authPath} replace />;
  }

  return <div ref={ref}>{children}</div>;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
