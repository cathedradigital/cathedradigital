/**
 * Painel de cadastro: orações, catecismo e novenas.
 * Acesso: login obrigatório + papel admin verificado no banco (RLS também protege as gravações).
 */
import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/rr-compat';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { NOVENAS, type NovenaDay } from '@/data/novenas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PRAYER_CATEGORIES = [
  'fundamentais', 'marianas', 'espirito_santo', 'santos', 'antes_depois',
  'protecao', 'momentos_do_dia', 'eucaristica', 'confissao_defuntos',
];
const NOVENA_CATEGORIES = ['Jesus Cristo', 'Virgem Maria', 'Santos', 'Espírito Santo'];

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function useAdminStatus(userId?: string) {
  return useQuery({
    queryKey: ['cadastro-admin', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: isAdmin }, { data: exists }] = await Promise.all([
        supabase.rpc('is_current_user_admin'),
        supabase.rpc('admin_exists'),
      ]);
      return { isAdmin: isAdmin === true, adminExists: exists === true };
    },
  });
}

/* ───────────── Orações ───────────── */
const emptyPrayer = { id: '', title: '', slug: '', category: 'fundamentais', subtitle: '', content: '', content_latin: '', source_ref: '', is_published: true };

function PrayersTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(emptyPrayer);
  const { data: list = [] } = useQuery({
    queryKey: ['adm-prayers'],
    queryFn: async () => (await supabase.from('prayers').select('*').order('title')).data ?? [],
  });
  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return toast.error('Título e texto são obrigatórios.');
    const payload: any = { ...form, slug: form.slug || slugify(form.title) };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from('prayers').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Oração salva.');
    setForm(emptyPrayer);
    qc.invalidateQueries({ queryKey: ['adm-prayers'] });
  };
  const remove = async (id: string) => {
    if (!confirm('Excluir esta oração?')) return;
    const { error } = await supabase.from('prayers').delete().eq('id', id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ['adm-prayers'] });
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>{form.id ? 'Editar oração' : 'Nova oração'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Subtítulo"><Input value={form.subtitle ?? ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></Field>
          <Field label="Categoria">
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {PRAYER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Texto"><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          <Field label="Texto em latim (opcional)"><Textarea rows={3} value={form.content_latin ?? ''} onChange={(e) => setForm({ ...form, content_latin: e.target.value })} /></Field>
          <Field label="Fonte"><Input value={form.source_ref ?? ''} onChange={(e) => setForm({ ...form, source_ref: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publicada</label>
          <div className="flex gap-2"><Button onClick={save}>Salvar</Button>{form.id && <Button variant="ghost" onClick={() => setForm(emptyPrayer)}>Cancelar</Button>}</div>
        </CardContent>
      </Card>
      <ItemList items={list} label={(p: any) => p.title} sub={(p: any) => p.category} onEdit={(p) => setForm({ ...emptyPrayer, ...p })} onDelete={(p: any) => remove(p.id)} />
    </div>
  );
}

/* ───────────── Catecismo ───────────── */
function CatechismTab() {
  const qc = useQueryClient();
  const [paragraph, setParagraph] = useState('');
  const [content, setContent] = useState('');
  const [bulk, setBulk] = useState('');
  const { data: stats } = useQuery({
    queryKey: ['adm-cic'],
    queryFn: async () => {
      const { count } = await supabase.from('catechism_official').select('paragraph', { count: 'exact', head: true });
      const { data } = await supabase.from('catechism_official').select('paragraph, content').order('paragraph', { ascending: false }).limit(20);
      return { count: count ?? 0, recent: data ?? [] };
    },
  });
  const saveOne = async () => {
    const n = Number(paragraph);
    if (!n || !content.trim()) return toast.error('Informe o número do parágrafo e o texto.');
    const { error } = await supabase.from('catechism_official').upsert({ paragraph: n, content: content.trim() });
    if (error) return toast.error(error.message);
    toast.success(`§${n} salvo.`);
    setParagraph(''); setContent('');
    qc.invalidateQueries({ queryKey: ['adm-cic'] });
  };
  const importBulk = async () => {
    // Cada parágrafo começa com seu número: "1. Deus, infinitamente..." ou "§1 ..."
    const rows: { paragraph: number; content: string }[] = [];
    const re = /(?:^|\n)\s*§?\s*(\d{1,4})[.)\s]\s*([\s\S]*?)(?=\n\s*§?\s*\d{1,4}[.)\s]|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(bulk))) {
      const n = Number(m[1]); const t = m[2].trim();
      if (n >= 1 && n <= 2865 && t) rows.push({ paragraph: n, content: t });
    }
    if (!rows.length) return toast.error('Nenhum parágrafo numerado encontrado.');
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from('catechism_official').upsert(rows.slice(i, i + 200));
      if (error) return toast.error(error.message);
    }
    toast.success(`${rows.length} parágrafos importados.`);
    setBulk('');
    qc.invalidateQueries({ queryKey: ['adm-cic'] });
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Parágrafo do Catecismo</CardTitle><CardDescription>{stats?.count ?? 0} de 2865 parágrafos cadastrados.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Número (1–2865)"><Input type="number" min={1} max={2865} value={paragraph} onChange={(e) => setParagraph(e.target.value)} /></Field>
            <Field label="Texto oficial"><Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} /></Field>
            <Button onClick={saveOne}>Salvar parágrafo</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Importar texto completo</CardTitle><CardDescription>Cole o texto com cada parágrafo começando pelo seu número (ex.: "1. Deus, infinitamente perfeito…"). Parágrafos já existentes são atualizados.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={10} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'1. Deus, infinitamente perfeito...\n2. Para que este apelo...'} />
            <Button onClick={importBulk}>Importar</Button>
          </CardContent>
        </Card>
      </div>
      <ItemList items={stats?.recent ?? []} label={(p: any) => `§${p.paragraph}`} sub={(p: any) => p.content.slice(0, 90) + '…'} onEdit={(p: any) => { setParagraph(String(p.paragraph)); setContent(p.content); }} />
    </div>
  );
}

/* ───────────── Novenas ───────────── */
const emptyNovena = { slug: '', title: '', latin: '', patron: '', category: 'Santos', summary: '', opening: '', closing: '', final_prayer: '', is_published: true, days: [] as NovenaDay[] };
const blankDays = (): NovenaDay[] => Array.from({ length: 9 }, (_, i) => ({ day: i + 1, title: '', scripture: '', meditation: '', intention: '' }));

function NovenasTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({ ...emptyNovena, days: blankDays() });
  const [editing, setEditing] = useState(false);
  const { data: list = [] } = useQuery({
    queryKey: ['adm-novenas'],
    queryFn: async () => (await supabase.from('novenas').select('*').order('order_index')).data ?? [],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['adm-novenas'] }); qc.invalidateQueries({ queryKey: ['novenas-public'] }); };
  const setDay = (i: number, k: keyof NovenaDay, v: string) => {
    const days = [...form.days]; days[i] = { ...days[i], [k]: v }; setForm({ ...form, days });
  };
  const save = async () => {
    if (!form.title.trim()) return toast.error('Informe o título.');
    const days = form.days.filter((d: NovenaDay) => d.meditation?.trim() || d.title?.trim()).map((d: NovenaDay, i: number) => ({ ...d, day: i + 1 }));
    const { error } = await supabase.from('novenas').upsert({ ...form, slug: form.slug || slugify(form.title), days });
    if (error) return toast.error(error.message);
    toast.success('Novena salva.');
    setForm({ ...emptyNovena, days: blankDays() }); setEditing(false); refresh();
  };
  const importDefaults = async () => {
    const rows = NOVENAS.map((n, i) => ({ slug: n.slug, title: n.title, latin: n.latin ?? null, patron: n.patron, category: n.category, summary: n.summary, opening: n.opening, closing: n.closing, final_prayer: n.finalPrayer, days: n.days, order_index: i }));
    const { error } = await supabase.from('novenas').upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} novenas do app copiadas para o cadastro.`); refresh();
  };
  const remove = async (slug: string) => {
    if (!confirm('Excluir esta novena?')) return;
    const { error } = await supabase.from('novenas').delete().eq('slug', slug);
    if (error) return toast.error(error.message);
    refresh();
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>{editing ? 'Editar novena' : 'Nova novena'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="A quem se dirige"><Input value={form.patron} onChange={(e) => setForm({ ...form, patron: e.target.value })} /></Field>
            <Field label="Categoria">
              <select className="w-full rounded-md border bg-background p-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {NOVENA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Resumo"><Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
          <Field label="Oração de abertura"><Textarea rows={3} value={form.opening} onChange={(e) => setForm({ ...form, opening: e.target.value })} /></Field>
          <Field label="Oração de encerramento"><Textarea rows={3} value={form.closing} onChange={(e) => setForm({ ...form, closing: e.target.value })} /></Field>
          <Field label="Oração final"><Textarea rows={3} value={form.final_prayer} onChange={(e) => setForm({ ...form, final_prayer: e.target.value })} /></Field>
          <div className="space-y-3">
            <Label>Os dias</Label>
            {form.days.map((d: NovenaDay, i: number) => (
              <div key={i} className="space-y-2 rounded-md border p-3">
                <p className="text-xs font-semibold text-muted-foreground">Dia {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Título do dia" value={d.title} onChange={(e) => setDay(i, 'title', e.target.value)} />
                  <Input placeholder="Referência bíblica" value={d.scripture ?? ''} onChange={(e) => setDay(i, 'scripture', e.target.value)} />
                </div>
                <Textarea rows={2} placeholder="Meditação" value={d.meditation} onChange={(e) => setDay(i, 'meditation', e.target.value)} />
                <Input placeholder="Intenção" value={d.intention} onChange={(e) => setDay(i, 'intention', e.target.value)} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, days: [...form.days, { day: form.days.length + 1, title: '', meditation: '', intention: '' }] })}>Adicionar dia</Button>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publicada</label>
          <div className="flex gap-2"><Button onClick={save}>Salvar</Button>{editing && <Button variant="ghost" onClick={() => { setForm({ ...emptyNovena, days: blankDays() }); setEditing(false); }}>Cancelar</Button>}</div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {list.length === 0 && (
          <Card><CardContent className="space-y-2 pt-6 text-sm">
            <p>O cadastro ainda está vazio — a tela Novenas mostra as {NOVENAS.length} novenas que já vêm no app.</p>
            <Button size="sm" onClick={importDefaults}>Copiar as novenas do app para o cadastro</Button>
          </CardContent></Card>
        )}
        <ItemList items={list} label={(n: any) => n.title} sub={(n: any) => `${n.category} · ${n.days?.length ?? 0} dias`} onEdit={(n: any) => { setForm({ ...emptyNovena, ...n, days: n.days?.length ? n.days : blankDays() }); setEditing(true); }} onDelete={(n: any) => remove(n.slug)} />
      </div>
    </div>
  );
}

/* ───────────── Compartilhados ───────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
function ItemList({ items, label, sub, onEdit, onDelete }: { items: any[]; label: (x: any) => string; sub: (x: any) => string; onEdit: (x: any) => void; onDelete?: (x: any) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>Cadastrados ({items.length})</CardTitle></CardHeader>
      <CardContent className="max-h-[70vh] space-y-2 overflow-auto">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nada cadastrado ainda.</p>}
        {items.map((it, i) => (
          <div key={i} className="flex items-start justify-between gap-2 rounded-md border p-2">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{label(it)}</p><p className="truncate text-xs text-muted-foreground">{sub(it)}</p></div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(it)}>Editar</Button>
              {onDelete && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(it)}>Excluir</Button>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CadastroAdmin() {
  const { user, loading } = useAuth();
  const { data: status, isLoading, refetch } = useAdminStatus(user?.id);

  useEffect(() => { document.title = 'Painel de cadastro · Cathedra'; }, []);

  const claim = async () => {
    const { data, error } = await supabase.rpc('claim_first_admin');
    if (error || !data) return toast.error('Não foi possível: já existe um administrador.');
    toast.success('Você agora é administrador.');
    refetch();
  };

  if (loading || (user && isLoading)) return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Painel de cadastro</h1>
        <p className="text-muted-foreground">Entre ou crie sua conta para cadastrar orações, catecismo e novenas.</p>
        <Button asChild><Link to="/auth?redirect=/admin/cadastro">Entrar ou criar conta</Link></Button>
      </div>
    );
  }

  if (!status?.isAdmin) {
    return (
      <div className="mx-auto max-w-md p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        {status?.adminExists ? (
          <p className="text-muted-foreground">Sua conta não tem permissão de administrador. Peça acesso a um administrador.</p>
        ) : (
          <>
            <p className="text-muted-foreground">Ainda não há administrador. Como primeira conta, você pode assumir a administração.</p>
            <Button onClick={claim}>Tornar-me administrador</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Painel de cadastro</h1>
        <p className="text-sm text-muted-foreground">O que você salvar aqui aparece imediatamente nas telas do app.</p>
      </div>
      <Tabs defaultValue="oracoes">
        <TabsList>
          <TabsTrigger value="oracoes">Orações</TabsTrigger>
          <TabsTrigger value="catecismo">Catecismo</TabsTrigger>
          <TabsTrigger value="novenas">Novenas</TabsTrigger>
        </TabsList>
        <TabsContent value="oracoes"><PrayersTab /></TabsContent>
        <TabsContent value="catecismo"><CatechismTab /></TabsContent>
        <TabsContent value="novenas"><NovenasTab /></TabsContent>
      </Tabs>
    </div>
  );
}
