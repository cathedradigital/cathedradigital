/**
 * Portal de Documentação — guia individual (`/docs/:slug`), localizado.
 */
import React, { useEffect, useMemo } from 'react';
import { Helmet } from '@/lib/helmet-compat';
import { Link, Navigate, useParams } from '@/lib/rr-compat';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { getDocsBundle, getDocGuide } from '@/content/docs';
import { recordDocView } from '@/lib/docsPopularity';


const PLATFORM_DOC_LINKS = [
  ['Carta do produto', 'product-charter.md'],
  ['Design system e paletas por módulo', 'design-system.md'],
  ['Contratos dos módulos', 'module-contracts.md'],
  ['Rotas e transições de páginas', 'navigation-routing.md'],
  ['Nexus / Conexo e proveniência', 'nexus-conexo.md'],
  ['Segurança e privacidade', 'security-baseline.md'],
  ['SEO técnico', 'seo-standard.md'],
  ['Acessibilidade e desempenho', 'accessibility-performance.md'],
  ['Qualidade e auditoria por módulo', 'quality-and-audit.md'],
  ['Conteúdo editorial e notícias do Átrio', 'editorial-content.md'],
  ['Publicação e validação Cloudflare', 'release-and-production.md'],
] as const;

function slugifyHeading(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function DocsArticlePage() {
  const { slug = '' } = useParams();
  const { lang } = useLang();
  const bundle = useMemo(() => getDocsBundle(lang), [lang]);
  const guide = useMemo(() => getDocGuide(lang, slug), [lang, slug]);

  // Popularidade local alimenta o desempate da busca do portal.
  useEffect(() => {
    if (guide) recordDocView(guide.slug);
  }, [guide]);

  if (!guide) return <Navigate to="/docs" replace />;


  return (
    <>
      <Helmet>
        <title>{`${guide.title} · ${bundle.ui.portalTitle} · Cátedra Digital`}</title>
        <meta name="description" content={guide.summary} />
      </Helmet>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          {bundle.ui.back}
        </Link>

        <header className="mt-6 mb-8 border-b border-border pb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {bundle.categories[guide.category]}
          </p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-foreground">{guide.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>
        </header>

        <nav aria-label={bundle.ui.onThisPage} className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{bundle.ui.onThisPage}</p>
          <ul className="space-y-1">
            {guide.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${slugifyHeading(section.heading)}`} className="text-sm text-primary hover:underline">
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading} id={slugifyHeading(section.heading)}>
              <h2 className="font-display text-xl font-bold text-foreground">{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="mt-3 text-base leading-relaxed text-foreground/85">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
        {slug === 'manual-tecnico-catedra-digital' && (
          <section aria-labelledby="platform-manual-links" className="mt-10 border-t border-border pt-6">
            <h2 id="platform-manual-links" className="font-display text-xl font-bold text-foreground">
              Documentação técnica completa
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Normas versionadas do produto. O conteúdo documenta critérios e não substitui a validação do código e da produção.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PLATFORM_DOC_LINKS.map(([label, file]) => (
                <li key={file}>
                  <a
                    href={`https://github.com/cathedradigital/cathedradigital/blob/main/docs/platform/${file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </>
  );
}
