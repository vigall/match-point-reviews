# Integração Nuvemshop (caminho híbrido)

Não é necessário abrir FTP nem editar `product.tpl`.  
O widget detecta a página de produto (`LS.product.id`) e monta a seção sozinho.

## 1. Confirmar CDN

Após o push na `main`, abra no navegador (não pode dar 404):

- https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-styles.css
- https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/supabase-reviews-client.js
- https://cdn.jsdelivr.net/gh/vigall/match-point-reviews@main/dist/reviews-widget.js

Se o cache atrasar, acrescente `?v=2` no final da URL.

## 2. (Opcional) CSS no tema

Admin → **Loja online → Layout → Editar layout atual → Edição de css avançada**  
Cole o conteúdo de `dist/reviews-styles.css` e publique.

Se preferir, o CSS também pode vir só do `<link>` do GTM (passo 3).

## 3. Google Tag Manager

1. [tagmanager.google.com](https://tagmanager.google.com/) → contêiner da loja  
2. **Nova tag** → **HTML personalizado**  
3. Cole o conteúdo de [`gtm-snippet.html`](./gtm-snippet.html)  
4. Acionamento: **All Pages**  
5. **Salvar → Enviar → Publicar**

Garanta que o GTM está vinculado em **Configurações → Códigos externos** na Nuvemshop.  
Guia oficial: [Scripts com GTM](https://atendimento.nuvemshop.com.br/12313-codigos-externos/como-adicionar-um-script-na-nuvemshop-usando-o-google-tag-manager-gtm).

## 4. Testar

1. Abra uma PDP (ex.: qualquer produto em matchpointsport.com.br)  
2. Hard refresh (`Ctrl+Shift+R`)  
3. Role até **Avaliações**  
4. Envie um teste → aprove em  
   https://supabase.com/dashboard/project/qabioapmusytvoaevwra/editor (`approved = true`)

## Rollback

- Pause/exclua a tag no GTM e publique  
- Remova o CSS do editor avançado, se tiver colado
