import React, { useEffect, useState } from 'react';
import { Navigate } from '@/lib/rr-compat';
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
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Nunca reutiliza a autorização do usuário anterior durante uma troca de sessão.
    setVerified(null);

    if (!user) {
      return () => {
        cancelled = true;
      };
    }

    const verifyAdminRole = async () => {
      try {
        // A tabela concede SELECT ao usuário autenticado e sua RLS limita
        // a leitura à própria linha (user_roles_select_own). Não depende de
        // RPCs administrativas cuja disponibilidade varia entre ambientes.
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[AdminGuard] Não foi possível verificar o papel administrativo:', error);
          setVerified(false);
          return;
        }

        setVerified(data?.role === 'admin');
      } catch (error) {
        if (cancelled) return;
        console.error('[AdminGuard] Falha ao verificar o papel administrativo:', error);
        setVerified(false);
      }
    };

    void verifyAdminRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  if (verified === null) return <Spinner />;
  if (!verified) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminGuard;
