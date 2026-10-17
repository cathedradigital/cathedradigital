/**
 * Tokens de acento por ambiente de navegação. Mantêm os valores visuais
 * existentes, mas oferecem uma única fonte de verdade para sidebar e módulos.
 * Contraste e semântica devem ser verificados antes de alterar estes tokens.
 */
export const MODULE_PALETTES: Record<
  'atrium' | 'estudar' | 'rezar' | 'formar-se' | 'pesquisar' | 'minha-jornada',
  { accent: string; accentSoft: string }
> = {
  atrium: { accent: '#BFA366', accentSoft: 'rgba(191,163,102,0.14)' },
  estudar: { accent: '#2f6f8f', accentSoft: 'rgba(47,111,143,0.14)' },
  rezar: { accent: '#8b5e83', accentSoft: 'rgba(139,94,131,0.14)' },
  'formar-se': { accent: '#b07a35', accentSoft: 'rgba(176,122,53,0.14)' },
  pesquisar: { accent: '#4f7d69', accentSoft: 'rgba(79,125,105,0.14)' },
  'minha-jornada': { accent: '#7a6aa6', accentSoft: 'rgba(122,106,166,0.14)' },
};

export const SACRED_PALETTE: Record<string, { primary: string; accent: string; depth: string }> = {
  green: { primary: '#0D2442', accent: '#BFA366', depth: '#061221' }, // Muted blue-green
  red: { primary: '#BFA366', accent: '#0D2442', depth: '#7A6438' }, // Muted gold-red
  purple: { primary: '#0D2442', accent: '#BFA366', depth: '#061221' },
  rose: { primary: '#BFA366', accent: '#0D2442', depth: '#7A6438' },
  black: { primary: '#1A1A1A', accent: '#BFA366', depth: '#000000' },
  white: { primary: '#FFFFFF', accent: '#BFA366', depth: '#F5F5F5' },
  gold: { primary: '#0D2442', accent: '#BFA366', depth: '#061221' },
};

export function getInitials(name: string): string {
  const skip = new Set(['são', 'santa', 'santo', 'de', 'da', 'do', 'dos', 'das', 'e', 'a', 'o', 'the', 'of']);
  const words = name.split(/\s+/).filter(w => !skip.has(w.toLowerCase()));
  if (words.length === 0) return name.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Paleta por categoria — usada como fallback quando não há retrato disponível.
// Doutor = ouro sobre azul-profundo (sapientia). Padre = bordô/ocre (tradição).
// Mártir = vermelho-carmim (sangue). Santo = azul-cathedra padrão.
const CATEGORY_PALETTE: Record<
  string,
  { primary: string; accent: string; depth: string }
> = {
  doctor: { primary: '#0D2442', accent: '#D4B36A', depth: '#050F1E' },
  father: { primary: '#3A1E17', accent: '#BFA366', depth: '#1F0F0B' },
  martyr: { primary: '#5A0E14', accent: '#D4B36A', depth: '#2A060A' },
  saint:  { primary: '#0D2442', accent: '#BFA366', depth: '#061221' },
};

export function resolveColors(
  liturgicalColor?: string,
  dominantColor?: string,
  category?: string,
) {
  const catKey = (category || '').toLowerCase();
  const catPalette = CATEGORY_PALETTE[catKey];
  const colorKey = liturgicalColor?.toLowerCase() || 'gold';
  const palette = catPalette || SACRED_PALETTE[colorKey] || SACRED_PALETTE.gold;
  return {
    base: dominantColor || palette.primary,
    accent: dominantColor ? `${dominantColor}cc` : palette.accent,
    depth: dominantColor ? `${dominantColor}66` : palette.depth,
  };
}

export function buildImageSrc(src: string, priority: boolean): string {
  if (!src) return '';
  if (src.includes('unsplash.com')) {
    const base = src.split('?')[0];
    return `${base}?auto=format&fit=crop&q=${priority ? '85' : '75'}&w=${priority ? '1400' : '800'}`;
  }
  if (src.includes('wikimedia.org') || src.includes('wikipedia.org')) {
    // Wikimedia bloqueia parte das requisições cross-origin com ERR_BLOCKED_BY_ORB
    // mesmo com referrerPolicy=no-referrer. Servimos via proxy wsrv.nl (CORS-friendly).
    let upscaled = src;
    if (src.includes('/thumb/')) {
      upscaled = src.replace(/\/\d+px-/g, `/${priority ? '1024' : '800'}px-`);
    }
    const stripped = upscaled.replace(/^https?:\/\//, '');
    return `https://wsrv.nl/?url=${encodeURIComponent(stripped)}&w=${priority ? 1024 : 800}&output=webp&q=${priority ? 85 : 75}`;
  }
  return src;
}
