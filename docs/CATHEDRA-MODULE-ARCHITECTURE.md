# Cátedra Digital — Arquitetura de módulos e diagramação

## Diagnóstico estrutural

A plataforma tinha uma arquitetura conceitual boa, mas a navegação estava fragmentada por camadas que competiam entre si:

- `APP_ROUTES` misturava rotas canônicas, aliases, conteúdo, usuário e administração.
- Havia duplicidade de entradas, como `/biblioteca` aparecendo em mais de uma categoria.
- A experiência pública alternava conceitos diferentes: **Peregrinação**, **Portal Sagrado**, **Tesouros da Fé**, **Sistema** e, em paralelo, os 5 ambientes canônicos.
- A Home tinha mais de uma implementação conceitual (`HomeUnified`, `AtriumHome`, `Index` legado), o que aumenta a sensação de produto inacabado.
- O mobile usava uma taxonomia diferente do desktop.
- Ferramentas transversais, conteúdo e áreas administrativas estavam conceitualmente próximos demais.

## Arquitetura pública canônica

```text
CATHEDRA
│
├── ESTUDAR
│   ├── Bíblia
│   ├── Catecismo
│   └── Magistério

├── PESQUISAR
│   ├── Buscar
│   ├── Nexus
│   ├── Biblioteca
│   └── demais ferramentas de referência
│
├── REZAR
│   ├── Orar
│   ├── Liturgia
│   ├── Lectio Divina
│   ├── Rosário
│   ├── Via Sacra
│   └── Novenas
│
├── FORMAR-SE
│   ├── Jornadas
│   └── Temas
│
└── MINHA JORNADA
    ├── Hoje
    ├── Diário
    ├── Favoritos
    ├── Conquistas
    ├── Perfil
    └── Configurações

TRANSVERSAIS (não competem com os 5 ambientes)
├── Logos IA
└── Comunidade

OPERAÇÃO (somente área administrativa protegida)
└── Admin
    ├── Segurança
    ├── Conteúdo / Bíblia
    ├── Nexus / Integridade
    ├── SEO / Integrações
    ├── Observabilidade
    └── Auditorias
```

## Regra de produto

**Um módulo deve ter um único endereço mental.**

- Se o usuário quer aprender uma fonte → **Estudar**.
- Se quer rezar → **Rezar**.
- Se quer seguir um percurso → **Formar-se**.
- Se quer encontrar algo → **Pesquisar**.
- Se quer retomar sua vida dentro da plataforma → **Minha Jornada**.
- IA e Comunidade são capacidades transversais.
- Admin nunca participa da navegação pública.

## Regras de diagramação

1. Uma única hierarquia de navegação no desktop e no mobile.
2. No máximo 5 entradas primárias.
3. Submódulos aparecem dentro do ambiente, não como novos itens de primeiro nível.
4. Aliases e rotas legadas continuam funcionando quando necessários, mas não aparecem no menu.
5. Administração não é conteúdo.
6. Auditoria não é produto.
7. Diagnóstico não é produto.
8. Logos não deve competir com Bíblia, Biblioteca ou Rezar; ele acompanha esses fluxos.
9. Nexus é infraestrutura de relação/descoberta, não uma segunda biblioteca.
10. Cada tela deve responder visualmente a três perguntas: **onde estou, o que posso fazer aqui e para onde continuo**.

## Estado de revisão

### Consolidar
- Home/Átrio como porta de entrada única.
- Navegação baseada nos 5 ambientes.
- Biblioteca como acervo, sem duplicação semântica.
- Minha Jornada como lugar único de continuidade pessoal.
- Logos como capacidade transversal.
- Nexus como camada de conexão.

### Retirar da navegação pública
- Dashboards administrativos.
- Auditorias.
- Telemetria.
- Diagnósticos.
- Páginas de dev/showcase.
- Rotas legadas.

### Revisar em seguida
- Unificação definitiva de `HomeUnified` e `AtriumHome`.
- Revisão de `APP_ROUTES` para que aliases não sejam tratados como módulos.
- Padronização das páginas de cada ambiente com `SpaceLayout`.
- Revisão de Breadcrumbs e títulos para refletirem a mesma taxonomia.
- Revisão de links órfãos e destinos duplicados.
