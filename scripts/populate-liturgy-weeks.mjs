#!/usr/bin/env node

/**
 * Popula leituras e meditações litúrgicas para um intervalo futuro.
 *
 * Segurança:
 * - exige SUPABASE_SERVICE_ROLE_KEY; nunca use a chave no frontend;
 * - valida que a fonte devolveu exatamente a data solicitada;
 * - faz upsert idempotente por iso_date;
 * - não sobrescreve meditações editoriais não-fallback sem --force.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   LITURGY_SOURCE_URL_TEMPLATE='https://fonte.example/{date}' \
 *   bun run populate:liturgy -- --weeks=4
 *
 * Placeholders aceitos em LITURGY_SOURCE_URL_TEMPLATE:
 * {date}, {iso_date}, {year}, {month}, {day}
 */

import process from 'node:process';

const DEFAULT_WEEKS = 4;
const MAX_WEEKS = 52;
const USER_AGENT = 'CathedraDigital-LiturgyPopulator/1.0';

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
}

function parseWeeks() {
  const weeks = Number(argValue('weeks', process.env.LITURGY_WEEKS ?? DEFAULT_WEEKS));
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > MAX_WEEKS) {
    throw new Error(`--weeks deve ser um inteiro entre 1 e ${MAX_WEEKS}.`);
  }
  return weeks;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function isoDate(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function nextSunday(start = new Date()) {
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const daysUntilSunday = (7 - date.getUTCDay()) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + daysUntilSunday);
  return date;
}

function datesForWeeks(weeks) {
  const start = nextSunday();
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return isoDate(date);
  });
}

function sourceUrl(template, date) {
  const [year, month, day] = date.split('-');
  return template
    .replaceAll('{date}', date)
    .replaceAll('{iso_date}', date)
    .replaceAll('{year}', year)
    .replaceAll('{month}', month)
    .replaceAll('{day}', day);
}

function normalizeReturnedDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  let match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function normalizeReading(value) {
  if (!value || typeof value !== 'object') return null;
  const texto = typeof value.texto === 'string' ? value.texto.trim() : '';
  if (!texto) return null;
  return {
    referencia: String(value.referencia ?? '').trim(),
    titulo: String(value.titulo ?? '').trim(),
    texto,
  };
}

function normalizePsalm(value) {
  if (!value || typeof value !== 'object') return null;
  const texto = typeof value.texto === 'string' ? value.texto.trim() : '';
  if (!texto) return null;
  return {
    referencia: String(value.referencia ?? '').trim(),
    refrao: String(value.refrao ?? '').trim(),
    texto,
  };
}

function normalizeSecondReading(value) {
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text || /^(não há|nao ha) segunda leitura\b/i.test(text)) return null;
    return { referencia: 'Segunda Leitura', titulo: 'Segunda Leitura', texto: text };
  }
  return normalizeReading(value);
}

function normalizedPayload(date, raw, source) {
  const returnedDate = normalizeReturnedDate(raw.data ?? raw.date ?? raw.iso_date);
  if (returnedDate !== date) {
    throw new Error(`Fonte devolveu ${returnedDate ?? 'data desconhecida'} para ${date}. URL: ${source}`);
  }
  return {
    iso_date: date,
    celebration_title: String(raw.liturgia ?? raw.celebration_title ?? '').trim(),
    liturgical_color: String(raw.cor ?? raw.liturgical_color ?? 'verde').trim(),
    day_description: String(raw.dia ?? raw.day_description ?? '').trim(),
    season: raw.season ? String(raw.season).trim() : null,
    first_reading: normalizeReading(raw.primeiraLeitura ?? raw.first_reading),
    psalm: normalizePsalm(raw.salmo ?? raw.psalm),
    second_reading: normalizeSecondReading(raw.segundaLeitura ?? raw.second_reading),
    gospel: normalizeReading(raw.evangelho ?? raw.gospel),
    source_url: source,
    source_fetched_at: new Date().toISOString(),
  };
}

function meditationFor(reading) {
  const gospel = reading.gospel?.referencia || 'o Evangelho do dia';
  const celebration = reading.celebration_title || 'a liturgia deste dia';
  const refrain = reading.psalm?.refrao;
  return {
    iso_date: reading.iso_date,
    theme: celebration,
    reading_key: refrain
      ? `Permaneça com o refrão do salmo: “${refrain}”. Deixe-o conduzir a sua oração.`
      : `Permaneça com ${gospel}. Leia o texto lentamente e acolha uma palavra para a oração.`,
    fathers: [],
    catechism: [],
    magisterium: [],
    logos: {
      observe: `Leia novamente ${gospel} sem pressa e observe o gesto central de Cristo.`,
      reflect: 'Pergunte onde esta Palavra encontra a sua vida concreta e as suas escolhas de hoje.',
      pray: 'Fale com o Senhor a partir da frase que mais permaneceu no coração.',
      live: 'Escolha um ato simples de fidelidade, caridade ou reconciliação para viver hoje.',
    },
    final_prayer: 'Senhor, guardai em mim a vossa Palavra. Dai-me um coração atento, humilde e perseverante, para que a liturgia deste dia se torne vida concreta. Amém.',
    church_history: null,
    action_of_day: 'Releia o Evangelho em silêncio por três minutos e pratique uma obra concreta de caridade.',
    version: 1,
    model: null,
    provider: 'populate-liturgy-weeks',
    prompt_hash: null,
    generated_at: new Date().toISOString(),
    fallback: true,
    fallback_code: 'local_builder',
    fallback_message: 'Meditação editorial gerada pelo populador local; revisar antes de promover a conteúdo editorial definitivo.',
    fallback_source: 'local-builder',
    fallback_retry_at: null,
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      'user-agent': USER_AGENT,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}: ${JSON.stringify(body).slice(0, 500)}`);
  return body;
}

async function upsertRows(baseUrl, serviceKey, table, rows) {
  if (!rows.length) return;
  await requestJson(`${baseUrl}/rest/v1/${table}?on_conflict=iso_date`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
}

async function existingMeditations(baseUrl, serviceKey, dates) {
  const filter = dates.join(',');
  const rows = await requestJson(`${baseUrl}/rest/v1/liturgy_meditations?select=iso_date,fallback&iso_date=in.(${filter})`, {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  });
  return new Map((rows ?? []).map((row) => [row.iso_date, row]));
}

async function main() {
  const baseUrl = requiredEnv('SUPABASE_URL').replace(/\/$/, '');
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const template = requiredEnv('LITURGY_SOURCE_URL_TEMPLATE');
  const weeks = parseWeeks();
  const force = hasFlag('force');
  const dates = datesForWeeks(weeks);

  console.log(`Populando ${dates.length} dias, de ${dates[0]} a ${dates.at(-1)}.`);
  const readings = [];
  for (const date of dates) {
    const url = sourceUrl(template, date);
    const raw = await requestJson(url);
    readings.push(normalizedPayload(date, raw, url));
    console.log(`OK leitura ${date}: ${readings.at(-1).celebration_title || 'sem título'}`);
  }

  const existing = await existingMeditations(baseUrl, serviceKey, dates);
  const meditations = readings
    .filter((reading) => force || !existing.has(reading.iso_date) || existing.get(reading.iso_date)?.fallback)
    .map(meditationFor);

  await upsertRows(baseUrl, serviceKey, 'liturgy_readings', readings);
  await upsertRows(baseUrl, serviceKey, 'liturgy_meditations', meditations);
  console.log(`Concluído: ${readings.length} leituras e ${meditations.length} meditações atualizadas.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`Falha: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}

export {
  datesForWeeks,
  meditationFor,
  normalizeSecondReading,
  normalizedPayload,
  sourceUrl,
};
