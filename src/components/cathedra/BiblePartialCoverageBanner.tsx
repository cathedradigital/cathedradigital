      <div className="container mx-auto flex items-start gap-3 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="flex-1">
          <h2 className="font-medium">Índice bíblico com cobertura parcial</h2>
          <p className="text-xs opacity-90">
            Alguns capítulos ainda não foram indexados localmente. A leitura dos
            capítulos disponíveis continua normal; recursos que dependem do índice
            podem ficar indisponíveis até a cobertura ser completada.
          </p>
        </div>
        <Link
 */
export const BiblePartialCoverageBanner: React.FC = () => {
  const { isLoading } = useBibleReadGate();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();

  if (isLoading || roleLoading) return null;
  if (isAdmin) return null;

  // O índice local ainda está incompleto (capítulos/versículos no banco).
  // A leitura, porém, pode usar a fonte bíblica de produção via Edge Function;
  // o aviso deve explicar a limitação sem mascarar a disponibilidade da leitura.
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/40"
    >
      <div className="container mx-auto flex items-start gap-3 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="flex-1">
          <h2 className="font-medium">Índice bíblico em sincronização</h2>
          <p className="text-xs opacity-90">
            O índice local ainda está sendo reconstruído. A leitura dos capítulos
            consulta a fonte bíblica de produção; alguns recursos, como a busca
            indexada, podem permanecer indisponíveis até a sincronização terminar.
          </p>
        </div>
        <Link
          to="/catechism"
          className="hidden shrink-0 rounded border border-amber-300 px-2 py-1 text-xs font-medium hover:bg-amber-100 sm:inline-block dark:border-amber-800 dark:hover:bg-amber-900/40"
        >
          Ler o Catecismo
        </Link>
      </div>
    </div>
  );
};

export default BiblePartialCoverageBanner;
