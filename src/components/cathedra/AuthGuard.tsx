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
    // Carry the full internal destination through the login screen.
    const next = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
    // Redirect directly to the canonical auth route; routing through the legacy
    // /login alias caused the destination to be nested inside next on some paths.
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  return <div ref={ref}>{children}</div>;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
