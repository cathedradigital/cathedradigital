import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from '@/lib/rr-compat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/db';

interface AdminGuardProps {
  children: React.ReactNode;
}

type AdminCheckState = 'checking' | 'authorized' | 'forbidden' | 'error';

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Verificando acesso administrativo">
    <div className="w-spacing-xl h-spacing-xl border-2 border-secondary border-t-transparent rounded-premium animate-spin" />
  </div>
);

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkState, setCheckState] = useState<AdminCheckState>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setCheckState('checking');
      return () => {
        cancelled = true;
      };
    }

    setCheckState('checking');

    const verifyAdminRole = async () => {
      try {
        // RLS permite ao usuário autenticado consultar somente a própria função.
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[AdminGuard] Falha técnica ao verificar a função administrativa:', error);
          setCheckState('error');
          return;
        }

        setCheckState(data?.role === 'admin' ? 'authorized' : 'forbidden');
      } catch (error) {
        if (cancelled) return;
        console.error('[AdminGuard] Erro inesperado ao verificar a função administrativa:', error);
        setCheckState('error');
      }
    };

    void verifyAdminRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id, attempt]);

  if (loading) return <Spinner />;

  if (!user) {
    const next = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (checkState === 'checking') return <Spinner />;

  if (checkState === 'error') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
        <h1 className="text-xl font-bold">Não foi possível verificar seu acesso</h1>
        <p className="text-sm text-muted-foreground">
          Sua sessão está ativa, mas ocorreu uma falha ao consultar as permissões administrativas.
          Nenhuma alteração foi feita na sua conta. Tente novamente.
        </p>
        <button
          type="button"
          onClick={() => setAttempt((current) => current + 1)}
          className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  if (checkState === 'forbidden') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
        <h1 className="text-xl font-bold">Acesso administrativo não autorizado</h1>
        <p className="text-sm text-muted-foreground">
          A sessão foi reconhecida, mas não foi encontrada uma função administrativa para esta conta.
          Se você acredita que isso está incorreto, entre em contato com o responsável pelo sistema.
        </p>
        <a href="/" className="rounded-md border border-border px-5 py-3 font-semibold">
          Voltar à Cátedra
        </a>
      </main>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
