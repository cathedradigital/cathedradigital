import React, { useState } from 'react';
import { useAnnouncements } from '../../hooks';

type NewsItem = {
  source: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  url: string;
};

const EDITORIAL_NEWS: NewsItem[] = [
  {
    source: 'Vatican News',
    category: 'Encerramento',
    date: '14 out. 2026',
    title: 'Leão XIV agradece aos participantes e pede que partilhem os frutos do encontro',
    summary: 'Na mensagem final, o Papa agradece a escuta e o trabalho conjunto; as reflexões pontifícias sobre o encontro serão apresentadas em momento oportuno, sem antecipar conclusões ainda não publicadas.',
    url: 'https://www.vaticannews.va/pt/papa/news/2026-10/papa-leao-xiv-mensagem-final-encontro-amoris-laetitia-2026.html',
  },
  {
    source: 'Vatican News',
    category: 'Síntese do encontro',
    date: '14 out. 2026',
    title: 'Encontro sobre Amoris laetitia: buscar novas respostas para novas perguntas',
    summary: 'A cobertura final apresenta os temas discutidos e as contribuições para o documento de síntese, distinguindo a reflexão pastoral de qualquer nova norma doutrinal.',
    url: 'https://www.vaticannews.va/pt/vaticano/news/2026-10/encontro-internacional-amoris-laetitia-encerramento-respostas-26.html',
  },
  {
    source: 'Santa Sé',
    category: 'Magistério',
    date: '7 out. 2026',
    title: 'Leão XIV: “Temos muito a aprender com as famílias”',
    summary: 'Na abertura do encontro pelos dez anos de Amoris laetitia, o Papa pede escuta, proximidade e discernimento pastoral diante das alegrias e fragilidades das famílias.',
    url: 'https://www.vatican.va/content/leo-xiv/pt/speeches/2026/october/documents/20261007-anniversario-amoris-laetitia.html',
  },
  {
    source: 'CNBB',
    category: 'Vida e Família',
    date: '8 out. 2026',
    title: 'A recepção da Amoris laetitia na pastoral familiar do Brasil',
    summary: 'Dom Bruno Versari apresenta experiências brasileiras de acompanhamento, formação para a vida matrimonial e integração das famílias na missão evangelizadora.',
    url: 'https://www.cnbb.org.br/dom-bruno-versari-aplicacao-amoris-laetitia-no-brasil/',
  },
  {
    source: 'CNBB',
    category: 'Igreja no mundo',
    date: '7 out. 2026',
    title: 'Encontro no Vaticano recorda dez anos da Amoris laetitia',
    summary: 'Síntese da abertura, dos participantes e das questões pastorais colocadas por Leão XIV.',
    url: 'https://www.cnbb.org.br/papa-leao-xiv-encontro-10-anos-amoris-laetitia/',
  },
  {
    source: 'Santa Sé',
    category: 'Agenda oficial',
    date: '14 out. 2026',
    title: 'Missa de encerramento do encontro',
    summary: 'O Cardeal Luis Antonio G. Tagle presidiu a celebração e leu a homilia preparada por Leão XIV; a página oficial reúne os materiais da Missa.',
    url: 'https://www.vatican.va/content/leo-xiv/pt/events/event.dir.html/content/vaticanevents/pt/2026/10/14/messa-amoris-laetitia.html',
  },
];

const News: React.FC = () => {
  const announcements = useAnnouncements();
  const [active, setActive] = useState(0);
  const item = EDITORIAL_NEWS[active];

  return (
    <section data-atrium-block="P6" aria-labelledby="atrium-news" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Curadoria editorial</p>
          <h2 id="atrium-news" className="mt-1 text-xl font-semibold">Notícias da Igreja</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Atualizações selecionadas de fontes católicas identificadas. Leia a matéria original na fonte.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://www.vaticannews.va/pt.html" target="_blank" rel="noreferrer" className="underline underline-offset-4">Vatican News</a>
          <a href="https://www.cnbb.org.br/" target="_blank" rel="noreferrer" className="underline underline-offset-4">CNBB</a>
          <a href="https://press.vatican.va/content/salastampa/pt.html" target="_blank" rel="noreferrer" className="underline underline-offset-4">Santa Sé</a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_12rem]">
          <article className="p-5 sm:p-7" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2.5 py-1">{item.source}</span>
              <span>{item.category}</span><span aria-hidden="true">·</span><time>{item.date}</time>
            </div>
            <h3 className="mt-4 max-w-3xl text-xl font-semibold leading-snug sm:text-2xl">{item.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{item.summary}</p>
            <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
              Ler na fonte original <span aria-hidden="true">↗</span>
            </a>
          </article>
          <aside className="flex flex-col justify-between gap-4 border-t border-border bg-muted/30 p-4 md:border-l md:border-t-0">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Destaques</p>
              <p className="mt-1 text-sm font-medium">{String(active + 1).padStart(2, '0')} / {String(EDITORIAL_NEWS.length).padStart(2, '0')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Notícia anterior" onClick={() => setActive((active + EDITORIAL_NEWS.length - 1) % EDITORIAL_NEWS.length)}>←</button>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Próxima notícia" onClick={() => setActive((active + 1) % EDITORIAL_NEWS.length)}>→</button>
            </div>
            <div className="flex gap-2" aria-label="Selecionar notícia">
              {EDITORIAL_NEWS.map((news, index) => (
                <button key={news.url} type="button" onClick={() => setActive(index)} aria-label={`Mostrar notícia ${index + 1}: ${news.title}`} aria-current={active === index ? 'true' : undefined} className={`h-1.5 flex-1 rounded-full ${active === index ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EDITORIAL_NEWS.map((news, index) => (
          <button key={news.url} type="button" onClick={() => setActive(index)} className={`rounded-xl border p-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active === index ? 'border-primary/60 bg-accent/30' : 'border-border bg-card'}`}>
            <span className="text-xs text-muted-foreground">{news.source} · {news.date}</span>
            <span className="mt-2 block text-sm font-medium leading-5">{news.title}</span>
          </button>
        ))}
      </div>

      {announcements.length > 0 && (
        <div className="border-t border-border pt-3">
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Avisos do Cátedra</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="text-sm text-muted-foreground">· {announcement.label}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default News;
