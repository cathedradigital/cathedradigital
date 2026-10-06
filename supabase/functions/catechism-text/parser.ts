const HTML_ENTITIES: Record<string, string> = {
  nbsp: " ",
  quot: '"',
  apos: "'",
  amp: "&",
  lt: "<",
  gt: ">",
  laquo: "«",
  raquo: "»",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  Aacute: "Á", aacute: "á",
  Acirc: "Â", acirc: "â",
  Atilde: "Ã", atilde: "ã",
  Agrave: "À", agrave: "à",
  Ccedil: "Ç", ccedil: "ç",
  Eacute: "É", eacute: "é",
  Ecirc: "Ê", ecirc: "ê",
  Iacute: "Í", iacute: "í",
  Oacute: "Ó", oacute: "ó",
  Ocirc: "Ô", ocirc: "ô",
  Otilde: "Õ", otilde: "õ",
  Ograve: "Ò", ograve: "ò",
  Uacute: "Ú", uacute: "ú",
  Ucirc: "Û", ucirc: "û",
  Yacute: "Ý", yacute: "ý",
  Egrave: "È", egrave: "è",
  Igrave: "Ì", igrave: "ì",
  Ugrave: "Ù", ugrave: "ù",
  Auml: "Ä", auml: "ä",
  Euml: "Ë", euml: "ë",
  Iuml: "Ï", iuml: "ï",
  Ouml: "Ö", ouml: "ö",
  Uuml: "Ü", uuml: "ü",
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _;
    })
    .replace(/&#([0-9]+);/g, (_, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _;
    })
    .replace(/&([a-z][a-z0-9]+);/gi, (full: string, name: string) => HTML_ENTITIES[name] ?? full);
}

function normalizeLine(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/\u00a0/g, " ")
    .replace(/[\t\r ]+/g, " ")
    .trim();
}

export function htmlToBlocks(html: string): string[] {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|blockquote|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return withBreaks
    .split(/\n+/)
    .map(normalizeLine)
    .filter(Boolean);
}

function paragraphMarker(paragraph: number): RegExp {
  return new RegExp("^" + paragraph + "\\.\\s+");
}

function isNotesHeading(block: string): boolean {
  return /^(?:notas|notes)\b/i.test(block);
}

function stripMarker(block: string, paragraph: number): string {
  return block.replace(paragraphMarker(paragraph), "").trim();
}

export function extractParagraph(
  html: string,
  paragraph: number,
  nextParagraph: number,
): string | null {
  const blocks = htmlToBlocks(html);
  const startIndex = blocks.findIndex((block) => paragraphMarker(paragraph).test(block));
  if (startIndex < 0) return null;

  const collected: string[] = [];
  for (let index = startIndex; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (index > startIndex && isNotesHeading(block)) break;
    if (index > startIndex && paragraphMarker(nextParagraph).test(block)) break;

    const content = index === startIndex ? stripMarker(block, paragraph) : block;
    if (content) collected.push(content);
  }

  const cleaned = collected
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned || cleaned.length < 5) return null;
  return cleaned;
}

export function isPlausibleCatechismParagraph(content: string | null, paragraph: number): boolean {
  if (!content) return false;
  const text = content.trim();
  if (text.length < 5) return false;

  if (/^(?:cf\.?|ibid\.?|idem\.?|[0-9]+\s*\(|[0-9]+\s*\.)/i.test(text)) return false;
  if (paragraph !== 2865 && text.length < 40) return false;

  return /[A-Za-zÀ-ÿÁ-ž]/.test(text) && /\s/.test(text);
}
