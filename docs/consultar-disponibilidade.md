# Leads — Consultar disponibilidade (WhatsApp)

Script híbrido (GTM + CDN) para a loja Nuvemshop Toluca.

## O que faz

- Esconde a tag **Esgotado** na PDP e nas listagens
- Só na PDP **sem estoque**: troca o botão por **Consultar disponibilidade** → WhatsApp
- PDP **com estoque**: mantém o **Comprar** nativo (não substitui)
- Desbloqueia o botão quando o tema deixa `disabled` / `nostock`
- Bloqueia add-to-cart só quando o CTA de lead está ativo
- **Listagens:** sem CTA (só esconde badge Esgotado)

Detecção de esgotado (Toluca): botão `nostock`/`disabled`/`Esgotado`, ou todas as variantes com `stock: 0` / `available: false`. `LS.product.available` nem sempre existe nesta loja.

## Arquivos

| Arquivo | Função |
|---------|--------|
| [`consultar-disponibilidade.js`](./consultar-disponibilidade.js) | Lógica |
| [`consultar-disponibilidade.css`](./consultar-disponibilidade.css) | Esconde badge + hint |

## CDN (jsDelivr)

Repo: [vigall/match-point-reviews](https://github.com/vigall/match-point-reviews)

```text
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@4ef671e/dist/consultar-disponibilidade.css
https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@4ef671e/dist/consultar-disponibilidade.js
```

## GTM (mesma tag das reviews)

Container `GTM-PWRPPNCD`. Editar a tag HTML das reviews e **acrescentar no final**:

```html
<!-- Match Point Leads — Consultar disponibilidade -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@4ef671e/dist/consultar-disponibilidade.css" />
<script src="https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@4ef671e/dist/consultar-disponibilidade.js"></script>
```

Salvar → Enviar → **Publicar**.

## Checklist de teste

1. PDP esgotada: https://matchpointsport.com.br/produtos/overgrip-head-xtreme-track-1qrrc/
   - Sem badge Esgotado
   - Botão clicável “Consultar disponibilidade”
   - Abre WhatsApp com produto/preço/link
   - Não adiciona ao carrinho
2. PDP **com estoque** (ex. HEAD Championship): botão continua **Comprar** (checkout normal)
3. Listagem: sem tag Esgotado; botão Comprar do card **inalterado**
4. Mobile: PDP esgotada abre WhatsApp; PDP com estoque compra normal

## Mensagem WhatsApp

```text
Olá, Match Point! Vi o produto "{NOME}" por {PREÇO} na loja e quero consultar disponibilidade.
Link: {URL}
```

Hint sob o botão: *Confirme prazo e frete no WhatsApp oficial da Match Point*
