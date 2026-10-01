<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent instructions — Cathedra

## Identidade do projeto

Cathedra / Digital Cathedral é um produto digital de formação católica. O objetivo é ajudar o usuário a rezar, estudar, aprofundar a fé e manter uma prática diária consistente.

## Regras de produto

- Trate **Hoje** como o centro da experiência.
- Priorize retenção por valor espiritual real, não por gamificação vazia.
- Não transforme o produto em um simples catálogo de conteúdos.
- Recursos premium devem ampliar profundidade e personalização sem bloquear o acesso básico ao Evangelho e à Bíblia.
- Toda funcionalidade comercial deve ter hipótese de valor, evento de analytics e definição clara de gratuito/premium.

## Conteúdo religioso

- Nunca invente versículos, citações, documentos, números de parágrafo ou atribuições.
- Preserve contexto e indicação da fonte.
- Quando uma afirmação doutrinal exigir autoridade, use fonte identificável e verificável.
- O Cáter deve distinguir texto-fonte, interpretação, resumo e inferência.\n- O Cáter só pode afirmar conteúdo doutrinal com fonte verificável recuperada; sem fonte suficiente, deve recusar a geração doutrinal.\n- Opinião de teólogo, santo ou autor nunca deve ser apresentada como Magistério sem fonte e qualificação explícita.

## Segurança

- Nunca commite `.env`, tokens, chaves privadas ou credenciais.
- Frontend guards não são fronteiras de segurança.
- Autorização deve ser aplicada no backend, banco/RLS ou função protegida.
- Toda função pública deve validar entrada e considerar abuso/rate limiting.
- Dados de diário, perfil, progresso e preferências devem ser tratados como dados privados.

## Engenharia

- Prefira mudanças pequenas, reversíveis e testáveis.
- Não faça refatorações amplas junto com mudança funcional sem necessidade.
- Preserve compatibilidade com o Lovable.
- Não reescreva histórico publicado.
- Não considere `console.warn` equivalente a teste que falha.
- Não masque falhas de CI com `|| true` sem uma justificativa explícita.

## Definition of Done

Uma mudança relevante deve:
1. compilar;
2. passar typecheck/lint aplicáveis;
3. possuir testes relevantes;
4. preservar mobile e acessibilidade;
5. não introduzir segredo;
6. documentar decisão quando alterar produto, segurança ou arquitetura.
