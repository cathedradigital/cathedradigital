import React from 'react';
import { useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = React.forwardRef<HTMLDivElement, AuthGuardProps>(({ children }, ref) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Preserve the protected URL in the browser address bar before the auth page
  // mounts. This deliberately avoids the legacy /login -> /auth SPA redirect,
  // whose compatibility-router navigation was dropping the query string.
  const next = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
  const loginUrl = `/auth?next=${encodeURIComponent(next)}`;

  React.useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      window.location.replace(loginUrl);
    }
  }, [loading, user, loginUrl]);

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
