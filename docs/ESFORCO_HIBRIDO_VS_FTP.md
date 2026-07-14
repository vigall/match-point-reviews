# Esforço real: Híbrido vs FTP

Guia para decidir e executar. Começa pelo **híbrido** (recomendado se quiser manter updates do Toluca).

O widget já está preparado para o híbrido: ele **cria sozinho** a seção de avaliações na página do produto usando `LS.product.id` — **não precisa editar `product.tpl`**.

---

# Visão do esforço (tamanho)

| | Híbrido | FTP |
|--|---------|-----|
| **Tempo total (1ª vez)** | ~45–90 min | ~90–180 min |
| **Ferramentas novas** | Conta GTM (ou push GitHub) | FileZilla |
| **Arquivos do tema** | **Nenhum** | 3 uploads + 2 edições |
| **Risco** | Baixo | Médio |
| **Rollback** | Desligar tag GTM / remover CSS | Restaurar backup ou Fechar FTP |
| **Updates do tema** | Preservados | Em risco enquanto FTP aberto |
| **Nível** | “Copiar e colar + cliques no admin” | “Cliente FTP + editar código” |

Em linguagem simples:

- **Híbrido** = você não mexe no “motor” do tema; só liga CSS e 3 scripts.
- **FTP** = você entra na “oficina” do tema, sobe peças e altera 2 arquivos-fonte.

---

# CAMINHO 1 — Híbrido (detalhado)

### O que você vai fazer, em 4 blocos

```text
[A] Deixar os JS públicos (GitHub)     ~15–30 min  (ou peço ajuda no commit)
[B] Colar CSS no editor da Nuvemshop   ~10–15 min
[C] Ligar os scripts (GTM)             ~20–40 min  (1ª vez com GTM)
[D] Testar na PDP + aprovar review     ~10–15 min
```

---

## A) Hospedar JS no GitHub (jsDelivr)

**Por quê:** a Nuvemshop precisa carregar os arquivos de uma URL pública. Sem FTP, usamos CDN.

**Esforço:** médio se nunca fez push; baixo se o repo já recebe commits.

### Passos

1. Confirme que estes arquivos existem no projeto:
   - `nuvemshop/reviews/reviews-styles.css`
   - `nuvemshop/reviews/supabase-reviews-client.js`
   - `nuvemshop/reviews/reviews-widget.js` ← já com auto-injeção
2. Faça **commit + push** para `vigall/match-point` na branch `main`  
   (se quiser, peça: “faz o commit e push dos reviews”).
3. Teste no navegador (tem que abrir o arquivo, não 404):

```text
https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/reviews-styles.css
https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/supabase-reviews-client.js
https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/reviews-widget.js
```

**Rollback deste bloco:** nada na loja ainda — só arquivos no GitHub.

---

## B) Colar o CSS no Toluca (sem FTP)

**Esforço:** baixo — só copiar/colar.

1. Admin Nuvemshop → **Loja online → Layout**
2. **Editar layout atual** (botão azul)
3. No menu lateral: **Edição de css avançada**
4. No final do campo CSS (não apague o que já existe), cole **todo** o conteúdo de `reviews-styles.css`
5. Clique **Testar CSS** (opcional)
6. Clique **Publicar alterações**

**Rollback:** apague o bloco colado → **Publicar alterações**.

---

## C) Ligar os 3 scripts via Google Tag Manager

**Esforço:** o maior bloco do híbrido (só na 1ª vez).  
Docs Nuvemshop: [adicionar script com GTM](https://atendimento.nuvemshop.com.br/12313-codigos-externos/como-adicionar-um-script-na-nuvemshop-usando-o-google-tag-manager-gtm).

### C1 — Se a loja **ainda não** tem GTM

1. Crie conta em [tagmanager.google.com](https://tagmanager.google.com/)
2. Crie um **Contêiner Web** para `matchpointsport.com.br`
3. Copie o ID (`GTM-XXXX`)
4. No admin Nuvemshop → **Configurações → Códigos externos** (ou integração GTM)
5. Cole o GTM onde a Nuvemshop pedir e **Salvar**

**Esforço extra:** +20–30 min se for a primeira vez.

### C2 — Criar a tag das avaliações

1. No GTM → **Nova tag**
2. Nome: `Match Point Reviews`
3. Tipo: **HTML personalizado**
4. Cole **exatamente** isto:

```html
<!-- Match Point Reviews -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/reviews-styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/supabase-reviews-client.js"></script>
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point@main/nuvemshop/reviews/reviews-widget.js"></script>
```

> Se já colou o CSS no passo B, pode **omitir** a linha `<link ...reviews-styles.css>` para não carregar 2 vezes.

5. **Acionamento** → **All Pages** (ou “Exibição de página”)  
   O widget só monta a UI se for página de produto (`template-product` / `LS.product`).
6. **Salvar** → **Enviar** → **Publicar** a versão do GTM

**Rollback:** no GTM, pause/exclua a tag → publique de novo. Loja volta ao normal em minutos.

---

## D) Testar

1. Abra uma PDP, ex.:  
   https://matchpointsport.com.br/produtos/bola-de-tenis-head-championship-tubo-3/
2. `Ctrl+Shift+R`
3. Role até depois da descrição → seção **Avaliações**
4. Envie um teste → no Supabase marque `approved = true`  
   https://supabase.com/dashboard/project/qabioapmusytvoaevwra/editor

**Se não aparecer:** F12 → Console/Network. Me mande o erro vermelho.

---

# CAMINHO 2 — FTP (detalhado)

### O que você vai fazer, em 5 blocos

```text
[0] Backup dos arquivos                 ~10–15 min   OBRIGATÓRIO
[1] Instalar + conectar FileZilla       ~15–30 min
[2] Subir CSS + 2 JS em static/         ~10–15 min
[3] Editar layout.tpl                   ~15–25 min
[4] Editar product.tpl                  ~15–25 min
[5] Testar                              ~10–15 min
```

---

## 0) Backup (não pule)

1. Conecte no FTP (passo 1)
2. Baixe para o PC (arraste da direita → esquerda no FileZilla):
   - `layout.tpl` (procure em `templates/` ou raiz)
   - `product.tpl`
3. Salve em pasta: `backup-toluca-YYYY-MM-DD/`

Sem isso, rollback fica difícil.

---

## 1) FileZilla

1. Baixe: https://filezilla-project.org/
2. Na tela Nuvemshop (FTP aberto):
   - Host: `ftp.nuvemshop.com.br`
   - Usuário: `matchpointsport`
   - Senha: botão **copiar** (não cole no chat)
3. Conexão rápida / Connect

**Esforço:** baixo–médio se nunca usou FTP.

---

## 2) Upload dos arquivos

No servidor (painel direito), abra `static/` e crie se faltar:

```text
static/css/
static/js/
```

Envie:

| PC | Servidor |
|----|----------|
| `nuvemshop/reviews/reviews-styles.css` | `static/css/reviews-styles.css` |
| `nuvemshop/reviews/supabase-reviews-client.js` | `static/js/supabase-reviews-client.js` |
| `nuvemshop/reviews/reviews-widget.js` | `static/js/reviews-widget.js` |

**Esforço:** baixo (arrastar e soltar).

---

## 3) Editar `layout.tpl`

1. Baixe `layout.tpl` → abra no Cursor/VS Code/Bloco de Notas
2. Acima de `</head>`:

```html
{{ 'css/reviews-styles.css' | static_url | stylesheet_tag }}
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

3. Acima de `</body>`:

```html
{{ 'js/supabase-reviews-client.js' | static_url | script_tag }}
{{ 'js/reviews-widget.js' | static_url | script_tag }}
```

4. Salve e **reenvie** o arquivo pelo FTP (substituir).

**Esforço:** médio — exige achar o arquivo certo e não quebrar tags.

---

## 4) Editar `product.tpl`

1. Baixe `product.tpl`
2. Ache a descrição / formulário do produto
3. Cole o conteúdo de `reviews-widget.liquid` **depois** da descrição  
   (no híbrido isso é automático; no FTP é manual — mas também funciona só com o JS auto-injetor + scripts no layout, se preferir pular este passo)
4. Reenvie pelo FTP

**Esforço:** médio — achar o ponto certo no Liquid.

---

## 5) Testar

Igual ao híbrido (PDP + Network + envio de review).

---

## Rollback no FTP (3 níveis)

### Nível 1 — só desligar reviews (~5 min)
- Tire as linhas dos scripts/CSS do `layout.tpl`
- Tire o bloco do `product.tpl` (se tiver colado)
- Reenvie esses arquivos

### Nível 2 — restaurar backup (~10 min)
- Reenvie `layout.tpl` e `product.tpl` da pasta `backup-toluca-...`
- Apague os 3 arquivos em `static/` se quiser

### Nível 3 — Fechar FTP na Nuvemshop (~5 min, mais agressivo)
- Layout → **Fechar FTP**
- Pode descartar **todas** as customizações de código do tema
- Só use com backup ou se aceitar resetar o código custom

---

# Qual escolher, em uma frase

- Quer **menos risco e manter update do Toluca** → **Híbrido** (blocos A→D).  
- Quer **tudo dentro do tema** e topa FileZilla + backup → **FTP**.

---

# Próximo passo sugerido

1. Você autoriza **commit + push** da pasta `nuvemshop/reviews`  
2. Depois fazemos juntos no browser: **CSS avançado** + **tag GTM**

Isso é o caminho híbrido completo, com esforço real de **~1 hora** se GTM já existir, ou **~1h30** se for criar o GTM agora.
