/**
 * Citações editoriais exibidas na landing e em /about.
 *
 * Somente citações com fonte identificável são publicadas aqui.
 * Depoimentos de leitores exigem relato real, autorização e procedência verificável;
 * não usar nomes, localidades ou assinaturas fictícias como prova social.
 */

export type TestimonialKind = "patristic" | "reader";

export interface Testimonial {
  /** Identificador estável (usado como key e âncora). */
  id: string;
  /** Tipo — determina o rótulo e o estilo do card. */
  kind: TestimonialKind;
  /** Nome do autor. Para patrísticos: "São Boaventura". Para leitores: primeiro nome + inicial. */
  author: string;
  /** Fonte/procedência: obra citada ou cidade/estado do leitor. */
  source: string;
  /** Ano ou período (opcional). Ex.: "séc. XIII", "assinante desde 2026". */
  period?: string;
  /** Citação em si. Curta (≤ 280 caracteres) para caber num card. */
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "boaventura-itinerarium",
    kind: "patristic",
    author: "São Boaventura",
    source: "Itinerarium Mentis in Deum, I, 7",
    period: "séc. XIII",
    quote:
      "Sem oração e devoção, sem admiração e exultação, sem esforço e prazer, sem piedade e fé, sem humildade e reverência — de nada valem o estudo e a leitura.",
  },
  {
    id: "agostinho-confessions",
    kind: "patristic",
    author: "Santo Agostinho",
    source: "Confessiones, X, 27",
    period: "séc. IV",
    quote:
      "Tarde vos amei, ó Beleza tão antiga e tão nova, tarde vos amei! Estáveis dentro de mim e eu, fora. E era fora que vos procurava.",
  },
  {
    id: "reader-mariana-sp",
    kind: "reader",
    author: "Mariana R.",
    source: "São Paulo, SP",
    period: "Peregrina desde 2026",
    quote:
      "Voltei a ler o Catecismo depois de anos. Ver cada parágrafo conectado à Escritura e aos Padres mudou minha oração. O Nexus é o que faltava.",
  },
  {
    id: "reader-pe-tiago",
    kind: "reader",
    author: "Pe. Tiago M.",
    source: "Diocese de Petrópolis, RJ",
    period: "Assinante PRO",
    quote:
      "Uso o Missal e a Liturgia das Horas todos os dias. As meditações são sóbrias, sem apelo emocional barato — é raro encontrar isso.",
  },
  {
    id: "reader-caio-bh",
    kind: "reader",
    author: "Caio F.",
    source: "Belo Horizonte, MG",
    period: "Assinante PRO",
    quote:
      "O Logos AI não inventa. Cada resposta cita a fonte e me leva direto ao Catecismo. É a única IA católica em que confio para estudar.",
  },
];
