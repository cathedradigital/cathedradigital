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

];
