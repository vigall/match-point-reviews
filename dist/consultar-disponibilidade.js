/**
 * Match Point — Consultar disponibilidade (PDP + listagens → WhatsApp lead)
 *
 * - Esconde badge "Esgotado" (PDP + listagens)
 * - PDPs: troca Comprar/Esgotado por "Consultar disponibilidade"
 * - Listagens: converte Comprar dos cards; injeta CTA quando o tema omite o botão (estoque 0)
 * - Desbloqueia disabled/nostock e abre WhatsApp com mensagem pronta
 */
(function () {
  'use strict';

  var WA_NUMBER = '5519997171734';
  var CTA_LABEL = 'Consultar disponibilidade';
  var HINT_TEXT =
    'Confirme prazo e frete no WhatsApp oficial da Match Point';
  var HANDLER_FLAG = 'data-mp-lead-bound';
  var HINT_FLAG = 'data-mp-lead-hint';
  var LISTING_INJECT_FLAG = 'data-mp-lead-listing';

  function isProductPage() {
    if (document.body && /\btemplate-product\b/.test(document.body.className)) {
      return true;
    }
    if (window.LS && LS.product && LS.product.id) {
      return true;
    }
    return !!document.getElementById('product_form');
  }

  function hideStockLabels(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(
      '[data-store="product-item-label-stock"], .js-stock-label, .js-stock-label-private'
    );
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.setProperty('display', 'none', 'important');
      nodes[i].setAttribute('aria-hidden', 'true');
    }
  }

  function cleanUrl(href) {
    try {
      var u = new URL(href, window.location.origin);
      u.searchParams.delete('_gl');
      u.searchParams.delete('gclid');
      u.searchParams.delete('fbclid');
      u.hash = '';
      return u.toString();
    } catch (e) {
      return String(href || '').split('#')[0];
    }
  }

  function formatCents(cents) {
    var n = Number(cents);
    if (!isFinite(n) || n <= 0) return null;
    return (
      'R$ ' +
      (n / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function textPrice(el) {
    if (!el) return null;
    var raw = el.getAttribute('data-priceraw-without-shipping');
    var fromRaw = formatCents(raw);
    if (fromRaw) return fromRaw + ' com Pix';
    var cents = el.getAttribute('data-product-price');
    var fromCents = formatCents(cents);
    if (fromCents) return fromCents;
    var txt = String(el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    return txt || null;
  }

  function pdpProductName() {
    if (window.LS && LS.product && LS.product.name) {
      return String(LS.product.name).trim();
    }
    var h1 =
      document.querySelector('h1.js-product-name') ||
      document.querySelector('h1');
    return h1 ? String(h1.textContent || '').trim() : 'produto';
  }

  function pdpProductPrice() {
    var pix = document.querySelector(
      '.js-price-container .js-payment-discount-price-product'
    );
    var fromPix = textPrice(pix);
    if (fromPix) return fromPix;

    var priceEl =
      document.getElementById('price_display') ||
      document.querySelector('.js-price-container .js-price-display');
    return textPrice(priceEl) || 'sob consulta';
  }

  function buildWhatsAppUrl(name, price, productUrl) {
    var msg =
      'Olá, Match Point! Vi o produto "' +
      (name || 'produto') +
      '" por ' +
      (price || 'sob consulta') +
      ' na loja e quero consultar disponibilidade.\nLink: ' +
      (productUrl || cleanUrl(window.location.href));
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function openWhatsApp(e, meta) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    meta = meta || {};
    var url = buildWhatsAppUrl(meta.name, meta.price, meta.url);
    window.open(url, '_blank', 'noopener,noreferrer');
    return false;
  }

  function setButtonLabel(el) {
    if (el.tagName === 'INPUT') {
      el.value = CTA_LABEL;
      if (el.hasAttribute('alt')) el.setAttribute('alt', CTA_LABEL);
    } else {
      el.textContent = CTA_LABEL;
    }
    el.setAttribute('aria-label', CTA_LABEL);
    el.setAttribute('title', CTA_LABEL);
  }

  function unlockAndRelabel(el) {
    el.disabled = false;
    el.removeAttribute('disabled');
    el.removeAttribute('aria-disabled');
    el.classList.remove('nostock');
    el.classList.add('mp-lead-cta');
    if (el.tagName === 'INPUT' || el.tagName === 'BUTTON') {
      try {
        el.type = 'button';
      } catch (err) {
        /* ignore */
      }
    }
    setButtonLabel(el);
  }

  function ensurePdpHint(el) {
    var form =
      el.closest('#product_form') ||
      el.closest('.js-product-form') ||
      el.closest('form');
    var host = form || el.parentNode;
    if (!host || host.getAttribute(HINT_FLAG) === '1') return;
    if (host.querySelector('.mp-lead-hint')) {
      host.setAttribute(HINT_FLAG, '1');
      return;
    }
    var hint = document.createElement('p');
    hint.className = 'mp-lead-hint';
    hint.textContent = HINT_TEXT;
    if (el.nextSibling) {
      el.parentNode.insertBefore(hint, el.nextSibling);
    } else {
      el.parentNode.appendChild(hint);
    }
    host.setAttribute(HINT_FLAG, '1');
  }

  function bindLeadClick(el, meta, withHint) {
    unlockAndRelabel(el);
    if (withHint) ensurePdpHint(el);
    if (el.getAttribute(HANDLER_FLAG) === '1') return;
    el.setAttribute(HANDLER_FLAG, '1');
    el.addEventListener(
      'click',
      function (e) {
        openWhatsApp(e, meta);
      },
      true
    );
  }

  function blockFormSubmit(form, meta) {
    if (!form || form.getAttribute(HANDLER_FLAG) === '1') return;
    form.setAttribute(HANDLER_FLAG, '1');
    form.addEventListener(
      'submit',
      function (e) {
        openWhatsApp(e, meta);
      },
      true
    );
  }

  function isPdpBuyButton(el) {
    if (!el || !el.getAttribute) return false;
    if (el.getAttribute('data-store') === 'product-buy-button') return true;
    if (el.getAttribute('data-component') === 'product.add-to-cart') return true;
    if (
      el.classList.contains('btn-add-to-cart') &&
      el.classList.contains('js-prod-submit-form') &&
      !el.getAttribute('data-component-value')
    ) {
      return true;
    }
    return false;
  }

  function findPdpBuyButtons() {
    var candidates = document.querySelectorAll(
      '[data-store="product-buy-button"], [data-component="product.add-to-cart"], .js-addtocart.js-prod-submit-form.btn-add-to-cart'
    );
    var out = [];
    for (var i = 0; i < candidates.length; i++) {
      if (isPdpBuyButton(candidates[i])) out.push(candidates[i]);
    }
    return out;
  }

  function enhancePdp() {
    if (!isProductPage()) return;

    var meta = {
      name: pdpProductName(),
      price: pdpProductPrice(),
      url: cleanUrl(window.location.href),
    };

    var buttons = findPdpBuyButtons();
    for (var i = 0; i < buttons.length; i++) {
      bindLeadClick(buttons[i], meta, true);
    }

    var form =
      document.getElementById('product_form') ||
      document.querySelector('.js-product-form') ||
      document.querySelector('form[data-store^="product-form-"]');
    blockFormSubmit(form, meta);
  }

  function cardProductUrl(card) {
    var link =
      card.querySelector('a[href*="/produtos/"]') ||
      card.querySelector('.js-item-name a[href]') ||
      card.querySelector('a.item-link[href]');
    if (link && link.getAttribute('href')) {
      return cleanUrl(link.href || link.getAttribute('href'));
    }
    var jsonLd = card.querySelector(
      'script[type="application/ld+json"][data-component="structured-data.item"]'
    );
    if (jsonLd) {
      try {
        var data = JSON.parse(jsonLd.textContent || '{}');
        var id =
          (data.mainEntityOfPage && data.mainEntityOfPage['@id']) || data.url;
        if (id) return cleanUrl(id);
      } catch (err) {
        /* ignore */
      }
    }
    return cleanUrl(window.location.href);
  }

  function cardProductName(card) {
    var nameEl =
      card.querySelector('[data-store^="product-item-name"]') ||
      card.querySelector('.js-item-name') ||
      card.querySelector('.item-name');
    if (nameEl) {
      return String(nameEl.textContent || '').trim();
    }
    var img = card.querySelector('img[alt]');
    if (img && img.alt) return String(img.alt).trim();
    return 'produto';
  }

  function cardProductPrice(card) {
    var pix = card.querySelector('.js-payment-discount-price-product');
    var fromPix = textPrice(pix);
    if (fromPix) return fromPix;
    var priceEl =
      card.querySelector('.js-price-display') ||
      card.querySelector('[data-store^="product-item-price"] .item-price');
    return textPrice(priceEl) || 'sob consulta';
  }

  function cardMeta(card) {
    return {
      name: cardProductName(card),
      price: cardProductPrice(card),
      url: cardProductUrl(card),
    };
  }

  function injectListingCta(card, meta) {
    if (card.getAttribute(LISTING_INJECT_FLAG) === '1') return;
    if (card.querySelector('.mp-lead-cta-listing')) {
      card.setAttribute(LISTING_INJECT_FLAG, '1');
      return;
    }

    var wrap = document.createElement('div');
    wrap.className =
      'js-quickshop-or-stock-container row row-grid mt-3 align-items-center mp-lead-listing-wrap';
    wrap.innerHTML =
      '<div class="js-item-quickshop-container item-actions col-grid col-md-9">' +
      '<button type="button" class="btn btn-primary btn-small btn-block mp-lead-cta mp-lead-cta-listing">' +
      CTA_LABEL +
      '</button></div>';

    var btn = wrap.querySelector('button');
    bindLeadClick(btn, meta, false);

    var anchor =
      card.querySelector('.js-item-colors-container') ||
      card.querySelector('[data-nubesdk-slot="after_product_grid_item_price"]') ||
      card.querySelector('.item-price-container') ||
      card.querySelector('.js-item-container');

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    } else {
      card.appendChild(wrap);
    }
    card.setAttribute(LISTING_INJECT_FLAG, '1');
  }

  function enhanceListingCards() {
    var cards = document.querySelectorAll(
      '.js-item-product[data-product-id], [data-component="product-list-item"][data-product-id]'
    );

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var meta = cardMeta(card);
      var buyBtns = card.querySelectorAll(
        '[data-component="product-list-item.add-to-cart"], .js-item-quickshop-container .js-addtocart'
      );

      if (buyBtns.length) {
        for (var j = 0; j < buyBtns.length; j++) {
          bindLeadClick(buyBtns[j], meta, false);
        }
        var form = card.querySelector('form.js-product-form');
        blockFormSubmit(form, meta);
        card.setAttribute(LISTING_INJECT_FLAG, '1');
      } else {
        // Estoque 0: Toluca omite o botão — injeta CTA
        injectListingCta(card, meta);
      }
    }
  }

  function tick() {
    hideStockLabels(document);
    enhancePdp();
    enhanceListingCards();
  }

  function startObserver() {
    if (!document.body || typeof MutationObserver === 'undefined') return;

    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        tick();
      }, 0);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'class', 'value', 'style'],
    });
  }

  function init() {
    tick();
    startObserver();
    setTimeout(tick, 400);
    setTimeout(tick, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
