# Documentação oficial — Cátedra Digital

**Revisão editorial:** 2026-10-29  
**Regra:** documentação descreve requisitos e evidências; não transforma proposta em implementação nem execução em aprovação.

## 1. Ordem de autoridade documental

1. **Documento Mestre — Parte I:** identidade, finalidade, princípios editoriais e técnicos.
2. **Documento Mestre — Parte II:** critérios operacionais, contratos, integração, qualidade e publicação.
3. **Especificações de módulos:** detalham requisitos e critérios por ambiente.
4. **Arquitetura técnica:** descreve a estrutura observada no repositório e seus limites.
5. **Políticas transversais:** segurança, qualidade, fontes e assistente.
6. **Guias operacionais:** desenvolvimento, deploy, incidentes e troubleshooting.
7. **Matriz de rastreabilidade:** liga requisitos a código, testes e evidências.

Em caso de divergência, registrar o conflito e atualizar os documentos dependentes; não manter cópias contraditórias como se fossem equivalentes.

## 2. Documentos principais

- [Documento Mestre — Parte I](./CATEDRA_DOCUMENTO_MESTRE_PARTE_I.md)
- [Complemento operacional — Parte II](./CATEDRA_DOCUMENTO_MESTRE_PARTE_II_COMPLEMENTO.md)
- [Matriz de rastreabilidade](./CATEDRA_MATRIZ_RASTREABILIDADE_REQUISITOS.md)

## 3. Arquitetura

- [Visão técnica](./architecture/overview.md)
- [Diagramas de arquitetura, módulos e publicação](./architecture/diagrams.md)

## 4. Especificações funcionais

- [Índice dos módulos](./modules/README.md)
- [Contrato transversal](./modules/CONTRATO_TRANSVERSAL.md)
- [Átrio](./modules/ATRIO.md)
- [Bíblia](./modules/BIBLIA.md)
- [Catecismo](./modules/CATECISMO.md)
- [Magistério e Documentos](./modules/MAGISTERIO_DOCUMENTOS.md)
- [Nexus / Conexo](./modules/NEXUS_CONEXO.md)
- [Rezar](./modules/REZAR.md)
- [Formar-se](./modules/FORMAR_SE.md)
- [Pesquisar](./modules/PESQUISAR.md)
- [Minha Jornada](./modules/MINHA_JORNADA.md)

**Lacuna registrada:** Igreja Viva aparece na arquitetura de produto, mas ainda precisa de especificação funcional própria. Não presumir que esteja coberta por outra especificação.

## 5. Políticas e operação

- [Visão do produto](./product/vision.md)
- [Segurança](./security/security.md)
- [Estratégia de qualidade e testes](./quality/testing.md)
- [Yá — fontes, teologia e segurança](./ai/logos.md)
- [Publicação e operação](../DEPLOYMENT.md)

## 6. Estados documentais e de implementação

Estados documentais:
- **Em elaboração**
- **Proposta para revisão**
- **Aprovado**
- **Substituído**

Estados de implementação, independentes dos estados documentais:
- **Especificado**
- **Mapeado**
- **Implementado**
- **Testado**
- **Aprovado**
- **Publicado**
- **Bloqueado**
- **Não verificado**

Uma especificação aprovada não prova que o código exista. Código existente não prova que foi testado. Testes aprovados não provam que a versão foi publicada.

## 7. Governança de atualização

Toda alteração documental relevante deve:
1. indicar versão/data e escopo;
2. apontar os arquivos e contratos afetados;
3. preservar referências e links internos;
4. identificar divergências ainda abertas;
5. evitar declarar funcionalidades não verificadas;
6. associar evidências técnicas ao SHA exato;
7. passar por revisão antes de ser integrada à branch principal.
