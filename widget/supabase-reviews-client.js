/**
 * Cliente Supabase para avaliações de produtos (Nuvemshop MVP).
 *
 * Pré-requisito no HTML:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *
 * Expõe: window.MatchPointReviews
 *   - getProductReviews(productId)
 *   - getProductRatingSummaries(productIds)
 *   - submitReview(reviewData)
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuração — use a anon/publishable key (NUNCA a service role)
  // ---------------------------------------------------------------------------
  var SUPABASE_URL = 'https://qabioapmusytvoaevwra.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhYmlvYXBtdXN5dHZvYWV2d3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDI2NTgsImV4cCI6MjA5OTU3ODY1OH0.THcDSYnhNlSVXDvsCWgmtgMUqKypshrgqQZibbVd6r0';
  var REVIEW_PHOTOS_BUCKET = 'review-photos';
  var MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
  var ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  var client = null;

  function getClient() {
    if (client) return client;
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      throw new Error(
        'Supabase JS não encontrado. Inclua o CDN @supabase/supabase-js@2 antes deste script.'
      );
    }
    client = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }

  function averageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < reviews.length; i++) {
      sum += Number(reviews[i].rating) || 0;
    }
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  function validateReviewInput(data) {
    if (!data || !data.productId) {
      throw new Error('Produto inválido.');
    }
    var name = (data.customerName || '').trim();
    if (name.length < 2) {
      throw new Error('Informe seu nome (mínimo 2 caracteres).');
    }
    if (name.length > 80) {
      throw new Error('Nome muito longo (máximo 80 caracteres).');
    }
    var rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Selecione uma nota de 1 a 5 estrelas.');
    }
    var comment = (data.comment || '').trim();
    if (comment.length < 10) {
      throw new Error('O comentário precisa ter pelo menos 10 caracteres.');
    }
    if (comment.length > 2000) {
      throw new Error('Comentário muito longo (máximo 2000 caracteres).');
    }
    var title = data.title != null ? String(data.title).trim() : '';
    if (title.length > 120) {
      throw new Error('Título muito longo (máximo 120 caracteres).');
    }
    // Honeypot anti-spam: se preenchido, rejeita em silêncio no submitReview
    return {
      productId: String(data.productId),
      orderId: data.orderId ? String(data.orderId).trim() : null,
      customerName: name,
      rating: rating,
      title: title || null,
      comment: comment,
      photoFile: data.photoFile || null,
      website: (data.website || '').trim(),
    };
  }

  function fileExtension(file) {
    var fromName = (file.name || '').split('.').pop();
    if (fromName && fromName.length <= 5) {
      return fromName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    }
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpg';
  }

  function uuid() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return (
      'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }) +
      '-' +
      Date.now().toString(16)
    );
  }

  /**
   * Faz upload da foto da avaliação.
   * @param {string} productId
   * @param {File} file
   * @returns {Promise<string>} URL pública
   */
  async function uploadReviewPhoto(productId, file) {
    if (!file) return null;

    if (ALLOWED_PHOTO_TYPES.indexOf(file.type) === -1) {
      throw new Error('Formato de imagem não suportado. Use JPEG, PNG ou WebP.');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      throw new Error('A foto deve ter no máximo 2MB.');
    }

    var supabase = getClient();
    var path = String(productId) + '/' + uuid() + '.' + fileExtension(file);

    var uploadResult = await supabase.storage
      .from(REVIEW_PHOTOS_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadResult.error) {
      throw new Error('Erro ao enviar foto: ' + uploadResult.error.message);
    }

    var publicUrl = supabase.storage
      .from(REVIEW_PHOTOS_BUCKET)
      .getPublicUrl(path);

    return publicUrl.data.publicUrl;
  }

  /**
   * Busca reviews aprovados de um produto.
   * @param {string|number} productId
   * @returns {Promise<{reviews: Array, averageRating: number, totalCount: number}>}
   */
  async function getProductReviews(productId) {
    try {
      var supabase = getClient();
      var result = await supabase
        .from('reviews')
        .select('id, customer_name, rating, title, comment, photo_url, created_at')
        .eq('product_id', String(productId))
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (result.error) {
        throw new Error(result.error.message);
      }

      var reviews = result.data || [];
      return {
        reviews: reviews,
        averageRating: averageRating(reviews),
        totalCount: reviews.length,
      };
    } catch (err) {
      console.error('[MatchPointReviews] getProductReviews:', err);
      throw new Error(
        err && err.message
          ? err.message
          : 'Não foi possível carregar as avaliações.'
      );
    }
  }

  /**
   * Busca média e quantidade de reviews aprovados para vários produtos (listagens).
   * @param {Array<string|number>} productIds
   * @returns {Promise<Record<string, {averageRating: number, totalCount: number}>>}
   */
  async function getProductRatingSummaries(productIds) {
    var summaries = {};
    if (!productIds || productIds.length === 0) return summaries;

    var unique = [];
    var seen = {};
    for (var i = 0; i < productIds.length; i++) {
      var id = String(productIds[i] || '').trim();
      if (!id || seen[id]) continue;
      seen[id] = true;
      unique.push(id);
    }
    if (unique.length === 0) return summaries;

    try {
      var supabase = getClient();
      var CHUNK = 80;
      var rows = [];

      for (var offset = 0; offset < unique.length; offset += CHUNK) {
        var chunk = unique.slice(offset, offset + CHUNK);
        var result = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', chunk)
          .eq('approved', true);

        if (result.error) {
          throw new Error(result.error.message);
        }
        if (result.data && result.data.length) {
          for (var r = 0; r < result.data.length; r++) {
            rows.push(result.data[r]);
          }
        }
      }

      var buckets = {};
      for (var j = 0; j < rows.length; j++) {
        var row = rows[j];
        var pid = String(row.product_id);
        if (!buckets[pid]) buckets[pid] = [];
        buckets[pid].push(row);
      }

      for (var k = 0; k < unique.length; k++) {
        var key = unique[k];
        var list = buckets[key] || [];
        if (list.length === 0) continue;
        summaries[key] = {
          averageRating: averageRating(list),
          totalCount: list.length,
        };
      }

      return summaries;
    } catch (err) {
      console.error('[MatchPointReviews] getProductRatingSummaries:', err);
      throw new Error(
        err && err.message
          ? err.message
          : 'Não foi possível carregar as notas dos produtos.'
      );
    }
  }

  /**
   * Envia uma nova avaliação (fica pending até moderação).
   * @param {object} reviewData
   * @param {string|number} reviewData.productId
   * @param {string} [reviewData.orderId]
   * @param {string} reviewData.customerName
   * @param {number} reviewData.rating
   * @param {string} [reviewData.title]
   * @param {string} reviewData.comment
   * @param {File} [reviewData.photoFile]
   * @param {string} [reviewData.website] honeypot
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async function submitReview(reviewData) {
    try {
      var input = validateReviewInput(reviewData);

      // Honeypot: bots preenchem campos ocultos — fingimos sucesso
      if (input.website) {
        return {
          ok: true,
          message: 'Avaliação enviada! Será publicada após moderação.',
        };
      }

      var photoUrl = null;
      if (input.photoFile) {
        photoUrl = await uploadReviewPhoto(input.productId, input.photoFile);
      }

      var supabase = getClient();
      var insertResult = await supabase.from('reviews').insert({
        product_id: input.productId,
        order_id: input.orderId,
        customer_name: input.customerName,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        photo_url: photoUrl,
        approved: false,
      });

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      return {
        ok: true,
        message: 'Avaliação enviada! Será publicada após moderação.',
      };
    } catch (err) {
      console.error('[MatchPointReviews] submitReview:', err);
      throw new Error(
        err && err.message
          ? err.message
          : 'Não foi possível enviar a avaliação. Tente novamente.'
      );
    }
  }

  global.MatchPointReviews = {
    getProductReviews: getProductReviews,
    getProductRatingSummaries: getProductRatingSummaries,
    submitReview: submitReview,
    uploadReviewPhoto: uploadReviewPhoto,
  };
})(typeof window !== 'undefined' ? window : globalThis);
