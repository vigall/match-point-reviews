/**
 * Match Point — Consultar disponibilidade (PDP → WhatsApp lead)
 *
 * - Esconde badge "Esgotado" (PDP + listagens)
 * - Em todas as PDPs: troca Comprar/Esgotado por "Consultar disponibilidade"
 * - Desbloqueia botão disabled/nostock e abre WhatsApp com mensagem pronta
 * - Listagens: sem alteração de CTA (só esconde badge Esgotado)
 */
(function () {
  'use strict';

  var WA_NUMBER = '5519997171734';
  var CTA_LABEL = 'Consultar disponibilidade';
  var HINT_TEXT =
    'Confirme prazo e frete no WhatsApp oficial da Match Point';
  var HANDLER_FLAG = 'data-mp-lead-bound';
  var HINT_FLAG = 'data-mp-lead-hint';

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

  function cleanPageUrl() {
    try {
      var u = new URL(window.location.href);
      u.searchParams.delete('_gl');
      u.searchParams.delete('gclid');
      u.searchParams.delete('fbclid');
      u.hash = '';
      return u.toString();
    } catch (e) {
      return window.location.href.split('#')[0];
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

  function productName() {
    if (window.LS && LS.product && LS.product.name) {
      return String(LS.product.name).trim();
    }
    var h1 =
      document.querySelector('h1.js-product-name') ||
      document.querySelector('h1');
    return h1 ? String(h1.textContent || '').trim() : 'produto';
  }

  function productPrice() {
    var pix = document.querySelector(
      '.js-price-container .js-payment-discount-price-product'
    );
    if (pix) {
      var raw = pix.getAttribute('data-priceraw-without-shipping');
      var formatted = formatCents(raw);
      if (formatted) return formatted + ' com Pix';
      var txt = String(pix.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (txt) return txt;
    }

    var priceEl =
      document.getElementById('price_display') ||
      document.querySelector('.js-price-container .js-price-display');
    if (priceEl) {
      var cents = priceEl.getAttribute('data-product-price');
      var fromCents = formatCents(cents);
      if (fromCents) return fromCents;
      var priceTxt = String(priceEl.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (priceTxt) return priceTxt;
    }

    return 'sob consulta';
  }

  function buildWhatsAppUrl() {
    var msg =
      'Olá, Match Point! Vi o produto "' +
      productName() +
      '" por ' +
      productPrice() +
      ' na loja e quero consultar disponibilidade.\nLink: ' +
      cleanPageUrl();
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function openWhatsApp(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    return false;
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
    el.classList.remove('cart');
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

  function ensureHint(el) {
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

  function bindButton(el) {
    unlockAndRelabel(el);
    ensureHint(el);
    if (el.getAttribute(HANDLER_FLAG) === '1') return;
    el.setAttribute(HANDLER_FLAG, '1');
    el.addEventListener('click', openWhatsApp, true);
  }

  function blockFormSubmit(form) {
    if (!form || form.getAttribute(HANDLER_FLAG) === '1') return;
    form.setAttribute(HANDLER_FLAG, '1');
    form.addEventListener('submit', openWhatsApp, true);
  }

  function enhancePdp() {
    if (!isProductPage()) return;

    var buttons = findPdpBuyButtons();
    for (var i = 0; i < buttons.length; i++) {
      bindButton(buttons[i]);
    }

    var form =
      document.getElementById('product_form') ||
      document.querySelector('.js-product-form') ||
      document.querySelector('form[data-store^="product-form-"]');
    blockFormSubmit(form);
  }

  function tick() {
    hideStockLabels(document);
    enhancePdp();
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
