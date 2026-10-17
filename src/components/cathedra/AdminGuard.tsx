import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/db';

interface AdminGuardProps {
  children: React.ReactNode;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Carregando">
    <div className="w-spacing-xl h-spacing-xl border-2 border-secondary border-t-transparent rounded-premium animate-spin" />
  </div>
);

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setVerified(null);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (!cancelled) setVerified(!error && data === true);
      } catch {
        // Fail closed on transport/runtime errors, but never leave the admin
        // guard in an infinite spinner when the RPC rejects instead of returning.
        if (!cancelled) setVerified(false);
        console.error('Falha ao verificar permissão administrativa.');
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) return <Spinner />;
  if (!user) {
    const next = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }
  if (verified === null) return <Spinner />;
  if (!verified) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminGuard;
