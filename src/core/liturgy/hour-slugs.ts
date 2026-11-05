/**
 * Contrato único dos identificadores das Horas Canônicas.
 * Identificadores históricos continuam aceitos apenas nas bordas de entrada.
 * "hora-media" permanece ambíguo no contrato geral.
 */
export const ALL_HOUR_SLUGS = [
  'oficio', 'laudes', 'tercia', 'sexta', 'noa', 'vesperas', 'completas',
] as const;

export type HourSlug = (typeof ALL_HOUR_SLUGS)[number];

const LEGACY_HOUR_SLUGS: Record<string, HourSlug> = {
  'oficio-leituras': 'oficio',
  terca: 'tercia',
};

export function normalizeHourSlug(value: string): HourSlug | null {
  if ((ALL_HOUR_SLUGS as readonly string[]).includes(value)) return value as HourSlug;
  return LEGACY_HOUR_SLUGS[value] ?? null;
}

export function isHourSlug(value: string | null): value is HourSlug {
  return !!value && normalizeHourSlug(value) === value;
}
