# Orçamento técnico do MVP — GitHub, Vercel e Supabase

A Cátedra deve permanecer pequena no deploy e grande no acervo. Princípio: código e UI no GitHub/Vercel; corpus documental no Supabase; arquivos grandes nunca entram no bundle do deploy.

## GitHub Free
- O repositório deve conter código, migrations, documentação e metadados.
- Não usar o Git para armazenar livros, PDFs, áudios ou dumps gerados.
- Arquivos binários grandes devem ficar fora do repositório; o GitHub recomenda armazenar arquivos gerados fora do Git e usar LFS quando necessário.
- Evitar dezenas de branches/PRs de longa duração.

## Vercel Hobby
- O deploy deve conter somente o aplicativo compilado e seus assets necessários.
- O corpus dos Padres, Santos e documentos não deve ser copiado para public/ nem empacotado no frontend.
- A build agora executa scripts/check-deploy-assets.mjs, que bloqueia arquivos individuais acima de 15 MB e um total de public/ acima de 250 MB.
- A retenção de deployments deve ser configurada no painel da Vercel; a integração disponível não possui operação para apagar deployments antigos.

## Supabase Free
- Banco: manter o catálogo e textos apenas quando houver valor de recuperação real.
- Evitar duplicar o mesmo documento em múltiplas tabelas.
- Corpus textual deve ser ingerido por referência/trecho e somente em texto integral quando os direitos estiverem verificados.
- Imagens e arquivos grandes devem ser exceção, não padrão.
- Monitorar banco, Storage, egress e Edge Functions antes de ampliar a ingestão.
- Se o corpus crescer além do orçamento, o primeiro passo é mover conteúdo pesado para uma camada de armazenamento apropriada, não aumentar o bundle do site.

## Estratégia de produto
1. Finalizar o MVP com os limites gratuitos.
2. Validar navegação, Bíblia, Catecismo, Magistério, Santos, Nexus e Cáter.
3. Medir uso real.
4. Só então ampliar o corpus ou contratar Pro.

Essa arquitetura permite trocar o plano sem refazer o produto: o código continua leve e o acervo continua separado por proveniência, direitos e autoridade.
