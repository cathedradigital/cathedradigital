# Arquitetura e contratos dos módulos

## Contrato comum de cada módulo

Cada módulo deve documentar: finalidade; rotas canônicas e aliases; fonte dos dados; estado de autenticação; ações principais; estados loading/empty/error; links de entrada e retorno; telemetria permitida; acessibilidade; testes; responsáveis por conteúdo; riscos conhecidos.

## Contratos funcionais

### Átrio
- Deve orientar a próxima ação: estudar, rezar, formar-se ou retomar jornada.
- Notícias são editoriais e devem linkar para fontes originais; avisos internos ficam separados de notícias externas.
- Não pode apresentar uma matéria como oficial sem origem e data verificáveis.

### Estudar
- **Bíblia:** preservar integridade de livro/capítulo/versículo, aliases legados, deep links e retorno à passagem. Alterações no módulo Bíblia exigem escopo explícito e regressão própria.
- **Catecismo:** resolver parágrafo canônico e aliases; o destino solicitado na URL deve prevalecer sobre observadores de rolagem até a restauração terminar.
- **Magistério/Documentos:** distinguir idioma original, idioma de leitura e tradução; manter o original acessível e identificar origem, autor e data.
- **Nexus/Conexo:** mostrar relações curadas e verificáveis, distinguindo citação direta de contexto editorial.
- **Biblioteca:** preservar metadados, origem, busca e leitura responsiva.
- **Santos/Igreja Viva:** mostrar proveniência e data quando conteúdo for temporal.

### Rezar
- Fluxos de oração devem minimizar distrações, manter sequência/estado quando aplicável e oferecer controles legíveis e acessíveis.
- Não substituir texto litúrgico aprovado por conteúdo gerado sem identificação e revisão.

### Formar-se
- Jornadas devem ter sequência, progresso persistente e estado gratuito/premium coerente com autorização no backend.
- A interface não é a barreira de segurança: verificar RLS e Edge Functions.

### Pesquisar
- Resultados devem identificar fonte, tipo de conteúdo e destino canônico.
- Consultas vazias, erros e ausência de resultados precisam de estados explícitos.

### Minha Jornada
- Diário, notas, marcações e progresso são privados por usuário.
- Requer sessão válida e autorização por linha/registro no banco; redirecionamentos de login preservam o destino completo e seguro.

### Yá
- Assistente de organização, comparação e explicação, não fonte doutrinal independente.
- Deve diferenciar fonte, paráfrase, inferência e incerteza; nunca inventar citações, referências ou status de execução.

## Integrações e dados

- Supabase é o backend real para os recursos que dependem de persistência.
- Migrações devem ser aditivas sempre que possível, revisadas e versionadas.
- Erros de schema/API, permissões e dados ausentes devem ser corrigidos na causa raiz; não ocultados por fallback que sugira sucesso.
- Segredos apenas em ambiente seguro; nunca em frontend, logs ou artefatos.

## Checklist de conformidade por módulo

- [ ] Rotas canônicas, aliases, refresh e links diretos.
- [ ] Entrada/saída e retorno de contexto.
- [ ] Desktop e mobile sem overflow ou controles sobrepostos.
- [ ] Loading, vazio, erro e sucesso real.
- [ ] Acessibilidade de teclado, foco e nomes acessíveis.
- [ ] Fonte e proveniência visíveis.
- [ ] Autorização de backend e RLS testadas quando há dados pessoais.
- [ ] E2E cobre a jornada principal e regressões conhecidas.
- [ ] Evidência anexada ao PR.