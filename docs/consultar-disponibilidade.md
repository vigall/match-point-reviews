# Leads — Consultar disponibilidade (WhatsApp)

Script híbrido (GTM + CDN) para a loja Nuvemshop Toluca.

## O que faz

- Esconde a tag **Esgotado** na PDP e nas listagens
- Em **todas as PDPs**, troca Comprar/Esgotado por **Consultar disponibilidade**
- Nas **listagens / relacionados**: converte o Comprar dos cards; se o tema omitir o botão (estoque 0), **injeta** o CTA
- Desbloqueia o botão quando o tema deixa `disabled` / `nostock`
- Abre WhatsApp `+55 19 99717-1734` com mensagem pronta (nome, preço, link do produto)
- Bloqueia add-to-cart no formulário da PDP e nos cards

## Arquivos

| Arquivo | Função |
|---------|--------|
| [`consultar-disponibilidade.js`](./consultar-disponibilidade.js) | Lógica |
| [`consultar-disponibilidade.css`](./consultar-disponibilidade.css) | Esconde badge + hint |

## CDN (jsDelivr)

Repo: [vigall/match-point-reviews](https://github.com/vigall/match-point-reviews)

Substitua `{SHA}` pelo commit publicado:

```text
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@ea4ee98/dist/consultar-disponibilidade.css
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@ea4ee98/dist/consultar-disponibilidade.js
```

## GTM (mesma tag das reviews)

Container `GTM-PWRPPNCD`. Editar a tag HTML das reviews e **acrescentar no final**:

```html
<!-- Match Point Leads — Consultar disponibilidade -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@ea4ee98/dist/consultar-disponibilidade.css" />
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@ea4ee98/dist/consultar-disponibilidade.js"></script>
```

Salvar → Enviar → **Publicar**.

## Checklist de teste

1. PDP esgotada: https://matchpointsport.com.br/produtos/overgrip-head-xtreme-track-1qrrc/
   - Sem badge Esgotado
   - Botão clicável “Consultar disponibilidade”
   - Abre WhatsApp com produto/preço/link
   - Não adiciona ao carrinho
2. PDP com estoque (qualquer produto disponível): mesmo CTA WhatsApp; preço visível
3. Listagem / categoria / similares: cards sem tag Esgotado; botão **Consultar disponibilidade** (convertido ou injetado)
4. Mobile: botão principal da PDP também abre WhatsApp

## Mensagem WhatsApp

```text
Olá, Match Point! Vi o produto "{NOME}" por {PREÇO} na loja e quero consultar disponibilidade.
Link: {URL}
```

Hint sob o botão: *Confirme prazo e frete no WhatsApp oficial da Match Point*
