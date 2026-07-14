-- ==============================================================================
-- Avaliações de produtos (Nuvemshop MVP)
-- Tabela reviews + bucket review-photos + RLS
-- ==============================================================================

-- 1) Tabela principal
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  order_id TEXT,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT NOT NULL,
  photo_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2) Índices
CREATE INDEX IF NOT EXISTS reviews_product_approved_created_idx
  ON public.reviews (product_id, approved, created_at DESC);

CREATE INDEX IF NOT EXISTS reviews_approved_created_idx
  ON public.reviews (approved, created_at DESC);

-- 3) RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Leitura pública apenas de reviews aprovados
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Inserção anônima com validações básicas (não permite auto-aprovação)
DROP POLICY IF EXISTS "Anon insert reviews" ON public.reviews;
CREATE POLICY "Anon insert reviews" ON public.reviews
FOR INSERT
TO anon
WITH CHECK (
  approved = false
  AND rating BETWEEN 1 AND 5
  AND length(trim(customer_name)) >= 2
  AND length(trim(customer_name)) <= 80
  AND length(trim(comment)) >= 10
  AND length(trim(comment)) <= 2000
  AND length(trim(product_id)) >= 1
  AND (title IS NULL OR length(trim(title)) <= 120)
  AND (order_id IS NULL OR length(trim(order_id)) <= 100)
  AND (photo_url IS NULL OR length(trim(photo_url)) <= 2048)
);

-- Sem policies de UPDATE/DELETE para anon/authenticated:
-- moderação (aprovar) é feita no Dashboard com service role.

-- 4) Storage — bucket público de fotos de avaliações
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública no bucket
DROP POLICY IF EXISTS "Public read review photos" ON storage.objects;
CREATE POLICY "Public read review photos" ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'review-photos');

-- Upload anônimo apenas no bucket review-photos
-- Path esperado: {product_id}/{filename}
DROP POLICY IF EXISTS "Anon upload review photos" ON storage.objects;
CREATE POLICY "Anon upload review photos" ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND length((storage.foldername(name))[1]) >= 1
);
