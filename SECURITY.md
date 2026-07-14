# Segurança (MVP)

## O que pode ser público

| Item | Público? | Motivo |
|------|----------|--------|
| Anon / publishable key | Sim | Necessária no browser; protegida por RLS |
| URL do projeto Supabase | Sim | Endpoint público da API |
| Código em `dist/` | Sim | CDN / loja |

## O que NUNCA deve ir para este repo

- `SUPABASE_SERVICE_ROLE_KEY`
- Senhas FTP Nuvemshop
- Tokens de conta Supabase / GitHub / admin
- Arquivos `.env` / `.env.local`

O `.gitignore` bloqueia `.env*` e pastas comuns de secrets.

## Controles já ativos no banco

1. **RLS em `reviews`**
   - `SELECT` público só com `approved = true`
   - `INSERT` anônimo força `approved = false` + validações de tamanho/rating
   - Sem `UPDATE`/`DELETE` público (moderação só no Dashboard / service role)

2. **Storage `review-photos`**
   - Leitura pública
   - Upload anônimo só nesse bucket, com pasta `{product_id}/…`
   - Limite de tipo/tamanho reforçado no client (JPEG/PNG/WebP, máx. 2MB)

3. **Honeypot** no formulário (`website`) para spam básico

## Recomendações de evolução

- Rate limit (Edge Function / CAPTCHA) se houver abuso
- Painel de moderação autenticado (em vez de Table Editor)
- Rotacionar a anon key se vazar em contexto errado (ex.: junto com service role)

## Responsabilidade

Este MVP prioriza velocidade. A segurança mínima é RLS + nunca commit de service role. Não é um sistema anti-fraude completo.
