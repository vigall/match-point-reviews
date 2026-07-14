/**
 * Widget de UI — avaliações na página do produto (Nuvemshop MVP).
 *
 * Pré-requisitos (nesta ordem):
 *   1. @supabase/supabase-js@2 (CDN)
 *   2. supabase-reviews-client.js → window.MatchPointReviews
 *   3. Este arquivo
 *
 * Markup #mp-reviews:
 *   - via product.tpl (FTP), OU
 *   - auto-injetado neste script (caminho híbrido) usando LS.product.id
 */
(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function detectProductId() {
    if (window.LS && LS.product && LS.product.id) {
      return String(LS.product.id);
    }
    var form = document.getElementById('product_form');
    if (form) {
      var store = form.getAttribute('data-store') || '';
      var match = store.match(/product-form-(\d+)/);
      if (match) return match[1];
      var hidden = form.querySelector('input[name="add_to_cart"]');
      if (hidden && hidden.value) return String(hidden.value);
    }
    return null;
  }

  function isProductPage() {
    if (document.body && /\btemplate-product\b/.test(document.body.className)) {
      return true;
    }
    return !!detectProductId();
  }

  function buildMarkup(productId) {
    return (
      '<section id="mp-reviews" class="mp-reviews" data-product-id="' +
      productId +
      '" aria-labelledby="mp-reviews-title">' +
      '<h2 id="mp-reviews-title" class="mp-reviews__heading">Avaliações</h2>' +
      '<div class="mp-reviews__summary" id="mp-reviews-summary" aria-live="polite">' +
      '<div class="mp-reviews__summary-stars" id="mp-reviews-summary-stars" aria-hidden="true"></div>' +
      '<div class="mp-reviews__summary-text">' +
      '<span class="mp-reviews__average" id="mp-reviews-average">—</span>' +
      '<span class="mp-reviews__count" id="mp-reviews-count">Carregando avaliações…</span>' +
      '</div></div>' +
      '<div class="mp-reviews__status" id="mp-reviews-status" role="status"></div>' +
      '<div class="mp-reviews__list" id="mp-reviews-list"></div>' +
      '<div class="mp-reviews__form-wrap">' +
      '<h3 class="mp-reviews__form-heading">Deixe sua avaliação</h3>' +
      '<form class="mp-reviews__form" id="mp-reviews-form" novalidate>' +
      '<div class="mp-reviews__honeypot" aria-hidden="true">' +
      '<label for="mp-review-website">Website</label>' +
      '<input type="text" id="mp-review-website" name="website" tabindex="-1" autocomplete="off" />' +
      '</div>' +
      '<div class="mp-reviews__field">' +
      '<label for="mp-review-name">Seu nome <span class="mp-reviews__required">*</span></label>' +
      '<input type="text" id="mp-review-name" name="customer_name" required minlength="2" maxlength="80" autocomplete="name" placeholder="Como devemos te chamar?" />' +
      '</div>' +
      '<div class="mp-reviews__field">' +
      '<span class="mp-reviews__label" id="mp-review-rating-label">Nota <span class="mp-reviews__required">*</span></span>' +
      '<div class="mp-reviews__rating-input" id="mp-review-rating" role="radiogroup" aria-labelledby="mp-review-rating-label">' +
      '<button type="button" class="mp-reviews__star-btn" data-value="1" aria-label="1 estrela">★</button>' +
      '<button type="button" class="mp-reviews__star-btn" data-value="2" aria-label="2 estrelas">★</button>' +
      '<button type="button" class="mp-reviews__star-btn" data-value="3" aria-label="3 estrelas">★</button>' +
      '<button type="button" class="mp-reviews__star-btn" data-value="4" aria-label="4 estrelas">★</button>' +
      '<button type="button" class="mp-reviews__star-btn" data-value="5" aria-label="5 estrelas">★</button>' +
      '</div>' +
      '<input type="hidden" id="mp-review-rating-value" name="rating" value="" required />' +
      '</div>' +
      '<div class="mp-reviews__field">' +
      '<label for="mp-review-title">Título <span class="mp-reviews__optional">(opcional)</span></label>' +
      '<input type="text" id="mp-review-title" name="title" maxlength="120" placeholder="Resumo da sua experiência" />' +
      '</div>' +
      '<div class="mp-reviews__field">' +
      '<label for="mp-review-comment">Comentário <span class="mp-reviews__required">*</span></label>' +
      '<textarea id="mp-review-comment" name="comment" required minlength="10" maxlength="2000" rows="4" placeholder="Conte o que achou do produto (mínimo 10 caracteres)"></textarea>' +
      '</div>' +
      '<div class="mp-reviews__field">' +
      '<label for="mp-review-photo">Foto <span class="mp-reviews__optional">(opcional, máx. 2MB)</span></label>' +
      '<input type="file" id="mp-review-photo" name="photo" accept="image/jpeg,image/png,image/webp" />' +
      '</div>' +
      '<p class="mp-reviews__form-message" id="mp-reviews-form-message" role="alert" hidden></p>' +
      '<button type="submit" class="mp-reviews__submit" id="mp-reviews-submit">Enviar avaliação</button>' +
      '</form></div></section>'
    );
  }

  function ensureMarkup(productId) {
    var existing = $('mp-reviews');
    if (existing) {
      if (!existing.getAttribute('data-product-id')) {
        existing.setAttribute('data-product-id', productId);
      }
      return existing;
    }

    var mount = document.createElement('div');
    mount.innerHTML = buildMarkup(productId);
    var section = mount.firstChild;

    var description =
      document.querySelector('.product-description') ||
      document.querySelector('[data-store="product-description"]') ||
      document.querySelector('#product-description') ||
      document.querySelector('.js-product-description');
    var related =
      document.querySelector('.related-products') ||
      document.querySelector('[data-store="related-products"]');
    var footer = document.querySelector('footer') || document.getElementById('footer');

    if (description && description.parentNode) {
      description.parentNode.insertBefore(section, description.nextSibling);
    } else if (related && related.parentNode) {
      related.parentNode.insertBefore(section, related);
    } else if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }
    return section;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderStars(rating, max) {
    max = max || 5;
    var html = '';
    var value = Number(rating) || 0;
    for (var i = 1; i <= max; i++) {
      var filled = i <= Math.round(value) ? ' mp-star--filled' : '';
      html += '<span class="mp-star' + filled + '" aria-hidden="true">★</span>';
    }
    return html;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.className = 'mp-reviews__status';
    if (type === 'error') el.classList.add('mp-reviews__status--error');
    if (type === 'loading') el.classList.add('mp-reviews__status--loading');
  }

  function setFormMessage(el, message, type) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      el.className = 'mp-reviews__form-message';
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.className =
      'mp-reviews__form-message mp-reviews__form-message--' + (type || 'error');
  }

  function renderSummary(average, total) {
    var starsEl = $('mp-reviews-summary-stars');
    var averageEl = $('mp-reviews-average');
    var countEl = $('mp-reviews-count');

    if (starsEl) {
      starsEl.innerHTML = total > 0 ? renderStars(average) : renderStars(0);
    }
    if (averageEl) {
      averageEl.textContent = total > 0 ? average.toFixed(1) : '—';
    }
    if (countEl) {
      if (total === 0) {
        countEl.textContent = 'Nenhuma avaliação ainda';
      } else if (total === 1) {
        countEl.textContent = '1 avaliação';
      } else {
        countEl.textContent = total + ' avaliações';
      }
    }
  }

  function renderList(reviews) {
    var listEl = $('mp-reviews-list');
    if (!listEl) return;

    if (!reviews || reviews.length === 0) {
      listEl.innerHTML =
        '<p class="mp-reviews__empty">Seja o primeiro a avaliar este produto.</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < reviews.length; i++) {
      var r = reviews[i];
      var title = r.title
        ? '<h4 class="mp-reviews__card-title">' + escapeHtml(r.title) + '</h4>'
        : '';
      var photo = r.photo_url
        ? '<img class="mp-reviews__card-photo" src="' +
          escapeHtml(r.photo_url) +
          '" alt="Foto da avaliação" loading="lazy" decoding="async" />'
        : '';

      html +=
        '<article class="mp-reviews__card">' +
        '<div class="mp-reviews__card-header">' +
        '<span class="mp-reviews__card-name">' +
        escapeHtml(r.customer_name) +
        '</span>' +
        '<time class="mp-reviews__card-date" datetime="' +
        escapeHtml(r.created_at) +
        '">' +
        escapeHtml(formatDate(r.created_at)) +
        '</time>' +
        '</div>' +
        '<div class="mp-reviews__card-stars" aria-label="' +
        escapeHtml(String(r.rating)) +
        ' de 5 estrelas">' +
        renderStars(r.rating) +
        '</div>' +
        title +
        '<p class="mp-reviews__card-comment">' +
        escapeHtml(r.comment) +
        '</p>' +
        photo +
        '</article>';
    }
    listEl.innerHTML = html;
  }

  function initRatingInput(root) {
    var buttons = root.querySelectorAll('.mp-reviews__star-btn');
    var hidden = $('mp-review-rating-value');
    var current = 0;

    function paint(hoverValue) {
      var target = hoverValue != null ? hoverValue : current;
      for (var i = 0; i < buttons.length; i++) {
        var val = Number(buttons[i].getAttribute('data-value'));
        buttons[i].classList.toggle('is-active', val <= current);
        buttons[i].classList.toggle('is-hover', hoverValue != null && val <= hoverValue);
        buttons[i].setAttribute('aria-checked', val === current ? 'true' : 'false');
        buttons[i].setAttribute('role', 'radio');
      }
      void target;
    }

    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          current = Number(btn.getAttribute('data-value'));
          if (hidden) hidden.value = String(current);
          paint();
        });
        btn.addEventListener('mouseenter', function () {
          paint(Number(btn.getAttribute('data-value')));
        });
        btn.addEventListener('mouseleave', function () {
          paint();
        });
        btn.addEventListener('focus', function () {
          paint(Number(btn.getAttribute('data-value')));
        });
        btn.addEventListener('blur', function () {
          paint();
        });
      })(buttons[i]);
    }

    paint();
  }

  async function loadReviews(productId) {
    var statusEl = $('mp-reviews-status');
    setStatus(statusEl, 'Carregando avaliações…', 'loading');

    try {
      var result = await window.MatchPointReviews.getProductReviews(productId);
      renderSummary(result.averageRating, result.totalCount);
      renderList(result.reviews);
      setStatus(statusEl, '', null);
    } catch (err) {
      renderSummary(0, 0);
      renderList([]);
      setStatus(
        statusEl,
        (err && err.message) || 'Erro ao carregar avaliações.',
        'error'
      );
    }
  }

  function initForm(productId) {
    var form = $('mp-reviews-form');
    var submitBtn = $('mp-reviews-submit');
    var messageEl = $('mp-reviews-form-message');
    if (!form) return;

    initRatingInput(form);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      setFormMessage(messageEl, '', null);

      var rating = Number(($('mp-review-rating-value') || {}).value);
      var nameInput = $('mp-review-name');
      var titleInput = $('mp-review-title');
      var commentInput = $('mp-review-comment');
      var photoInput = $('mp-review-photo');
      var websiteInput = $('mp-review-website');

      if (!rating || rating < 1 || rating > 5) {
        setFormMessage(messageEl, 'Selecione uma nota de 1 a 5 estrelas.', 'error');
        return;
      }

      var photoFile =
        photoInput && photoInput.files && photoInput.files[0]
          ? photoInput.files[0]
          : null;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.textContent = 'Enviando…';
      }

      try {
        var result = await window.MatchPointReviews.submitReview({
          productId: productId,
          customerName: nameInput ? nameInput.value : '',
          rating: rating,
          title: titleInput ? titleInput.value : '',
          comment: commentInput ? commentInput.value : '',
          photoFile: photoFile,
          website: websiteInput ? websiteInput.value : '',
        });

        setFormMessage(messageEl, result.message, 'success');
        form.reset();
        var hidden = $('mp-review-rating-value');
        if (hidden) hidden.value = '';
        // Re-pinta estrelas após reset
        var buttons = form.querySelectorAll('.mp-reviews__star-btn');
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].classList.remove('is-active', 'is-hover');
          buttons[i].setAttribute('aria-checked', 'false');
        }
      } catch (err) {
        setFormMessage(
          messageEl,
          (err && err.message) || 'Não foi possível enviar. Tente novamente.',
          'error'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          submitBtn.textContent = 'Enviar avaliação';
        }
      }
    });
  }

  function init() {
    if (!isProductPage()) return;

    var productId = detectProductId();
    if (!productId) return;

    var root = ensureMarkup(productId);
    if (!root) return;

    if (!window.MatchPointReviews) {
      setStatus(
        $('mp-reviews-status'),
        'Widget de avaliações não carregou corretamente.',
        'error'
      );
      return;
    }

    loadReviews(productId);
    initForm(productId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
