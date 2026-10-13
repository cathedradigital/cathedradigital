/**
 * Lógica pura de filtragem, ordenação e realce para o Explorer de Magistério.
 * Isolada em módulo próprio para permitir testes unitários sem montar o React.
 */
import type { MagisteriumDocument } from '@/data/magisterium-urls';

export type MagisteriumSort = 'canonical' | 'chronological-asc' | 'chronological-desc';

/** Tamanho fixo da página do Explorer. Ajustado ao grid 3-col para não gerar
 *  linhas “órfãs” em desktop. */
export const MAGISTERIUM_PAGE_SIZE = 12;

export interface MagisteriumFilterState {
  search: string;
  category: string | null;
  type: string | null;
  author: string | null;
  pontificate: string | null;
  period: string | null;
  year: string | null;
  themes: string[];
  sort: MagisteriumSort;
  /** Página 1-indexada. */
  page: number;
}

export const DEFAULT_FILTER_STATE: MagisteriumFilterState = {
  search: '',
  category: null,
  type: null,
  author: null,
  pontificate: null,
  period: null,
  year: null,
  themes: [],
  sort: 'canonical',
  page: 1,
};

const dateKey = (d: MagisteriumDocument): string => d.date ?? `${d.year}`;

export const MAGISTERIUM_PERIODS = [
  { value: 'before-1500', label: 'Até 1500', min: Number.NEGATIVE_INFINITY, max: 1500 },
  { value: '1501-1799', label: '1501–1799', min: 1501, max: 1799 },
  { value: '1800-1899', label: '1800–1899', min: 1800, max: 1899 },
  { value: '1900-1999', label: '1900–1999', min: 1900, max: 1999 },
  { value: '2000-plus', label: '2000 em diante', min: 2000, max: Number.POSITIVE_INFINITY },
] as const;

function matchesPeriod(year: number, period: string): boolean {
  const selected = MAGISTERIUM_PERIODS.find((item) => item.value === period);
  return selected ? year >= selected.min && year <= selected.max : true;
}

export function matchesSearch(doc: MagisteriumDocument, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    doc.title.toLowerCase().includes(q) ||
    doc.author.toLowerCase().includes(q) ||
    (doc.abbr?.toLowerCase().includes(q) ?? false) ||
    doc.themes.some(t => t.toLowerCase().includes(q)) ||
    doc.summary.toLowerCase().includes(q)
  );
}

export function filterAndSortDocuments(
  docs: readonly MagisteriumDocument[],
  state: MagisteriumFilterState,
  categoryOrder: Record<string, number>,
): MagisteriumDocument[] {
  const filtered = docs.filter(doc => {
    if (state.category && doc.category !== state.category) return false;
    if (state.type && doc.type !== state.type) return false;
    if (state.author && doc.author !== state.author) return false;
    if (state.pontificate && (doc.pontificate ?? '') !== state.pontificate) return false;
    if (state.year && String(doc.year) !== state.year) return false;
    if (state.period && !matchesPeriod(doc.year, state.period)) return false;
    if (state.themes.length > 0 && !state.themes.every(t => doc.themes.includes(t))) return false;
    return matchesSearch(doc, state.search);
  });

  if (state.sort === 'canonical') {
    return [...filtered].sort((a, b) => {
      const ca = categoryOrder[a.category] ?? 999;
      const cb = categoryOrder[b.category] ?? 999;
      if (ca !== cb) return ca - cb;
      return dateKey(a).localeCompare(dateKey(b));
    });
  }
  const dir = state.sort === 'chronological-asc' ? 1 : -1;
  return [...filtered].sort((a, b) => dir * dateKey(a).localeCompare(dateKey(b)));
}

// ---------------------------------------------------------------------------
// URL persistence
// ---------------------------------------------------------------------------

const PARAM_KEYS = {
  q: 'q', cat: 'cat', type: 'type', author: 'author',
  pontificate: 'pontificate', period: 'period', year: 'year',
  theme: 'theme', sort: 'sort', page: 'page',
} as const;
const VALID_SORTS: MagisteriumSort[] = ['canonical', 'chronological-asc', 'chronological-desc'];

export function stateToSearchParams(state: MagisteriumFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.search) params.set(PARAM_KEYS.q, state.search);
  if (state.category) params.set(PARAM_KEYS.cat, state.category);
  if (state.type) params.set(PARAM_KEYS.type, state.type);
  if (state.author) params.set(PARAM_KEYS.author, state.author);
  if (state.pontificate) params.set(PARAM_KEYS.pontificate, state.pontificate);
  if (state.period) params.set(PARAM_KEYS.period, state.period);
  if (state.year) params.set(PARAM_KEYS.year, state.year);
  for (const t of state.themes) params.append(PARAM_KEYS.theme, t);
  if (state.sort !== 'canonical') params.set(PARAM_KEYS.sort, state.sort);
  if (state.page > 1) params.set(PARAM_KEYS.page, String(state.page));
  return params;
}

export function searchParamsToState(params: URLSearchParams): MagisteriumFilterState {
  const rawSort = params.get(PARAM_KEYS.sort);
  const sort = (VALID_SORTS as string[]).includes(rawSort ?? '')
    ? (rawSort as MagisteriumSort)
    : 'canonical';
  const rawPage = Number(params.get(PARAM_KEYS.page));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  return {
    search: params.get(PARAM_KEYS.q) ?? '',
    category: params.get(PARAM_KEYS.cat),
    type: params.get(PARAM_KEYS.type),
    author: params.get(PARAM_KEYS.author),
    pontificate: params.get(PARAM_KEYS.pontificate),
    period: params.get(PARAM_KEYS.period),
    year: params.get(PARAM_KEYS.year),
    themes: params.getAll(PARAM_KEYS.theme),
    sort,
    page,
  };
}

/**
 * Merge somente as chaves do Explorer no URLSearchParams atual — preserva
 * outros params (`topic`, `doc`) usados por outros fluxos da página.
 */
export function mergeFilterParams(
  current: URLSearchParams,
  state: MagisteriumFilterState,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const key of Object.values(PARAM_KEYS)) next.delete(key);
  const patch = stateToSearchParams(state);
  patch.forEach((value, key) => next.append(key, value));
  return next;
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

export interface PaginationResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** Fatia a lista pelo `page` do state, com clamp seguro. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = MAGISTERIUM_PAGE_SIZE,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clamped = Math.min(Math.max(1, page), totalPages);
  const start = (clamped - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: clamped,
    totalPages,
    totalItems,
    pageSize,
  };
}

// ---------------------------------------------------------------------------
// Highlight
// ---------------------------------------------------------------------------

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface HighlightSegment {
  text: string;
  match: boolean;
}

export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const q = query.trim();
  if (!q || !text) return [{ text, match: false }];
  const re = new RegExp(`(${escapeRegex(q)})`, 'gi');
  const parts = text.split(re);
  return parts
    .filter(p => p.length > 0)
    .map(part => ({ text: part, match: part.toLowerCase() === q.toLowerCase() }));
}
