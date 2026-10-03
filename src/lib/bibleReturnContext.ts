export interface BibleReturnContext {
  book: string;
  chapter: number;
  verse?: number;
  label: string;
  createdAt: number;
}

const KEY = 'cathedra:bible:return-context';

export function saveBibleReturnContext(context: Omit<BibleReturnContext, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify({ ...context, createdAt: Date.now() }));
}

export function readBibleReturnContext(): BibleReturnContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value?.book || !Number.isInteger(value.chapter)) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearBibleReturnContext(): void {
  if (typeof window !== 'undefined') sessionStorage.removeItem(KEY);
}
