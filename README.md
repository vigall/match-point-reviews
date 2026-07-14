# Match Point Reviews

Widget de avaliações de produtos para a loja [Match Point Sport](https://matchpointsport.com.br/) (Nuvemshop), com backend no Supabase.

Repositório **público e mínimo**, pensado para ser servido via [jsDelivr](https://www.jsdelivr.com/).

## Estrutura

```text
match-point-reviews/
├── dist/                         # Arquivos consumidos pela loja (CDN)
│   ├── reviews-styles.css
│   ├── supabase-reviews-client.js
│   └── reviews-widget.js
├── sql/
│   └── 001_reviews.sql           # Tabela + RLS + Storage
├── docs/
│   ├── INTEGRACAO.md             # Passo a passo Nuvemshop / GTM
│   └── gtm-snippet.html          # HTML pronto para colar no GTM
├── SECURITY.md                   # Segurança mínima (RLS / chaves)
├── .gitignore
└── README.md
```

## URLs CDN (após o push na `main`)

```text
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-styles.css
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/supabase-reviews-client.js
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-widget.js
```

## Como funciona

1. Na página de produto, o `reviews-widget.js` detecta `LS.product.id` e monta a UI.
2. Lê/grava no Supabase com a **anon key** (protegida por RLS).
3. Novas avaliações nascem com `approved = false` e só aparecem após moderação no Dashboard.

## Integração rápida

Veja [`docs/INTEGRACAO.md`](docs/INTEGRACAO.md). Snippet GTM: [`docs/gtm-snippet.html`](docs/gtm-snippet.html).

## Projeto Supabase

- URL: `https://qabioapmusytvoaevwra.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/qabioapmusytvoaevwra
- SQL já aplicado; reaplicar com `sql/001_reviews.sql` se necessário.

## Licença

Uso interno Match Point Sport.
