/**
 * Persistência da última rota autenticada visitada.
 * Usada para restaurar o contexto do usuário após novo login
 * e para redirecionar da Landing (/) direto ao Átrio.
 */
const KEY = 'cathedra_last_route';

const EXCLUDED_PREFIXES = [
  '/auth',
  '/login',
  '/reset-password',
  '/.lovable',
  '/oauth',
];

const EXCLUDED_EXACT = new Set<string>(['/', '']);

/** Aliases que não devem sobreviver como destino de retorno após login. */
const CANONICAL_ALIASES: Record<string, string> = {
  '/igreja': '/community',
  '/atrium': '/',
  '/home': '/',
  '/home-v3': '/',
  '/legacy-home': '/',
};

export function canonicalizeRoute(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  return CANONICAL_ALIASES[clean] ?? clean;
}

export function isTrackableRoute(pathname: string): boolean {
  if (!pathname) return false;
  const clean = pathname.split(/[?#]/)[0];
  if (EXCLUDED_EXACT.has(clean)) return false;
  return !EXCLUDED_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`));
}

export function setLastRoute(pathname: string): void {
  try {
    const canonical = canonicalizeRoute(pathname);
    if (!isTrackableRoute(canonical)) return;
    localStorage.setItem(KEY, canonical);
  } catch {
    /* storage indisponível */
  }
}

export function getLastRoute(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return null;
    const canonical = canonicalizeRoute(v);
    if (!isTrackableRoute(canonical)) return null;
    if (canonical !== v) localStorage.setItem(KEY, canonical);
    return canonical;
  } catch {
    return null;
  }
}

export function clearLastRoute(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** Rota padrão do usuário autenticado quando não há histórico. */
export const DEFAULT_AUTH_HOME = '/atrium';

export function resolveAuthHome(): string {
  return getLastRoute() ?? DEFAULT_AUTH_HOME;
}
