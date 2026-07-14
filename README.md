# Match Point Reviews

Widget público de **avaliações de produtos** para [Match Point Sport](https://matchpointsport.com.br/) (Nuvemshop) + Supabase.

Repositório **público** para servir arquivos via [jsDelivr](https://www.jsdelivr.com/) (sem FTP no tema).

## Estrutura

```text
dist/     → CSS/JS para CDN (caminho estável)
widget/   → mesma cópia + Liquid opcional (FTP)
sql/      → migration Supabase
docs/     → instalação Nuvemshop / GTM
```

## URLs CDN

```text
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-styles.css
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/supabase-reviews-client.js
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-widget.js
```

Equivalente em `widget/`:

```text
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/widget/reviews-widget.js
```

## Snippet GTM

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/supabase-reviews-client.js"></script>
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-widget.js"></script>
```

O widget auto-injeta a seção na PDP (`LS.product.id`). Não precisa editar `product.tpl`.

## Segurança

Ver [SECURITY.md](SECURITY.md). Só anon key no front; nunca service role. RLS no Supabase.

## Backend

Projeto: `qabioapmusytvoaevwra` · SQL: [`sql/001_reviews.sql`](sql/001_reviews.sql)
