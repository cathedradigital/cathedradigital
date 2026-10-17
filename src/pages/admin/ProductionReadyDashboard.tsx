import { useMemo } from "react";
import { Helmet } from '@/lib/helmet-compat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Gauge, Search, Accessibility, TestTube2, Layout, Zap } from "lucide-react";

interface Checkpoint {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'pending' | 'failed';
  value?: string | number;
  evidence?: string;
  category: 'seo' | 'a11y' | 'perf' | 'tests' | 'architecture';
}

export default function ProductionReadyDashboard() {
  const checkpoints: Checkpoint[] = [
    // SEO
    { id: 'seo-headings', label: 'Hierarquia de Headings', status: 'pending', value: 'Não verificado', evidence: 'Aguardando relatório verificável da auditoria de rotas', category: 'seo' },
    { id: 'seo-sitemap', label: 'Sitemap Consistente', status: 'pending', value: 'Não verificado', evidence: 'Aguardando leitura e validação do sitemap publicado', category: 'seo' },
    { id: 'seo-meta', label: 'Meta Tags & Open Graph', status: 'pending', value: 'Não verificado', evidence: 'Aguardando inspeção de metadados em páginas reais', category: 'seo' },
    
    // Acessibilidade
    { id: 'a11y-axe', label: 'Violações Axe-core', status: 'pending', value: 'Não verificado', evidence: 'Aguardando execução e artefato Axe/WCAG', category: 'a11y' },
    { id: 'a11y-touch', label: 'Touch Targets (44px)', status: 'pending', value: 'Não verificado', evidence: 'Aguardando medição real dos alvos de toque', category: 'a11y' },
    { id: 'a11y-contrast', label: 'Contraste de Cores', status: 'pending', value: 'Não verificado', evidence: 'Aguardando medição real de contraste', category: 'a11y' },
    
    // Performance
    { id: 'perf-lighthouse', label: 'Lighthouse Score', status: 'pending', value: 'Não verificado', evidence: 'Aguardando medição Lighthouse/Core Web Vitals', category: 'perf' },
    { id: 'perf-bundle', label: 'Bundle Size (Gzip)', status: 'pending', value: 'Não verificado', evidence: 'Aguardando relatório de build do commit atual', category: 'perf' },
    
    // Testes
    { id: 'test-playwright', label: 'E2E Playwright', status: 'pending', value: 'Não verificado', evidence: 'Aguardando Playwright verde no SHA final', category: 'tests' },
    { id: 'test-vitest', label: 'Unitários (Vitest)', status: 'pending', value: 'Não verificado', evidence: 'Aguardando resultado real dos testes unitários', category: 'tests' },
    { id: 'test-visual', label: 'Regressão Visual', status: 'pending', value: 'Não verificado', evidence: 'Aguardando comparação de regressão visual', category: 'tests' },
    
    // Arquitetura & Guardrails
    { id: 'arch-reader', label: 'Reader V2 Certification', status: 'pending', value: 'Não verificado', evidence: 'Aguardando verificação funcional do leitor', category: 'architecture' },
    { id: 'arch-nexus', label: 'Nexus Intelligence', status: 'pending', value: 'Não verificado', evidence: 'Aguardando testes de ida e retorno do Nexus', category: 'architecture' },
    { id: 'arch-guardrail', label: 'Guardrail Enforcement', status: 'pending', value: 'Não verificado', evidence: 'Aguardando inspeção do workflow de proteção', category: 'architecture' },
  ];

  const categories = [
    { id: 'architecture', label: 'Arquitetura & Reader', icon: Layout, color: 'text-blue-500' },
    { id: 'seo', label: 'SEO & Indexação', icon: Search, color: 'text-emerald-500' },
    { id: 'a11y', label: 'Acessibilidade (A11y)', icon: Accessibility, color: 'text-purple-500' },
    { id: 'perf', label: 'Performance (Core Web Vitals)', icon: Gauge, color: 'text-amber-500' },
    { id: 'tests', label: 'Testes & Regressão', icon: TestTube2, color: 'text-rose-500' },
  ];

  const stats = useMemo(() => {
    const total = checkpoints.length;
    const passed = checkpoints.filter(c => c.status === 'passed').length;
    const percent = Math.round((passed / total) * 100);
    return { total, passed, percent };
  }, [checkpoints]);

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <Helmet>
        <title>Production Ready Dashboard · Cathedra</title>
      </Helmet>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="text-primary font-mono mb-2">FASE 5 — CONSOLIDAÇÃO</Badge>
          <h1 className="text-3xl font-black tracking-tight font-display">Production Ready Dashboard</h1>
          <p className="text-muted-foreground">Status global de certificação e integridade do Cathedra Digital 3.0.</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-premium">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Integridade Global</p>
            <p className="text-2xl font-black">{stats.percent}%</p>
          </div>
          <div className="w-24">
            <Progress value={stats.percent} className="h-2" />
          </div>
          <Clock className="w-8 h-8 text-amber-500" aria-hidden="true" />
        </div>
      </header>

      <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">Verificação real pendente</p>
        <p className="mt-1 text-muted-foreground">Este painel não está conectado às execuções de CI, Playwright, Lighthouse ou à publicação. Os indicadores abaixo ficam pendentes até haver evidência verificável; não representam aprovação automática.</p>
      </div>

      <div className="grid gap-6">
        {categories.map(cat => (
          <Card key={cat.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: 'currentColor' }}>
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  <CardTitle className="text-lg font-bold">{cat.label}</CardTitle>
                </div>
                <Badge variant="outline">PENDENTE</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkpoints.filter(c => c.category === cat.id).map(check => (
                  <div key={check.id} className="group p-4 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-sm leading-tight">{check.label}</p>
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-muted-foreground uppercase">Valor:</span>
                        <span className="text-sm font-black">{check.value}</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                          <span className="font-bold text-primary/70">EVIDÊNCIA:</span> {check.evidence}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Próximo Marco: Fase 6 — Consolidação do Conteúdo</CardTitle>
          </div>
          <CardDescription>
            A expansão do acervo só deve ser priorizada depois da validação funcional, de segurança e de publicação com evidências reais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['100 Santos Prioritários', 'Catecismo Completo', 'Bíblia Completo', 'Patrística', 'Magistério', 'Missal', 'Nexus 100% Connected'].map(item => (
              <Badge key={item} variant="secondary" className="bg-background border-border">{item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
