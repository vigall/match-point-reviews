-- Auto-approve reviews + Telegram notify trigger (applied remotely as reviews_auto_approve_telegram)
-- Kept here for repo history / replay.

ALTER TABLE public.reviews
  ALTER COLUMN approved SET DEFAULT true;

DROP POLICY IF EXISTS "Anon insert reviews" ON public.reviews;
CREATE POLICY "Anon insert reviews" ON public.reviews
FOR INSERT
TO anon
WITH CHECK (
  approved = true
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

CREATE OR REPLACE FUNCTION public.get_telegram_secrets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_object_agg(name, decrypted_secret) INTO result
  FROM vault.decrypted_secrets
  WHERE name IN (
    'telegram_bot_token',
    'telegram_admin_chat_id',
    'telegram_webhook_secret'
  );
  RETURN coalesce(result, '{}'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_telegram_secrets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_telegram_secrets() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_telegram_secrets() TO service_role;

CREATE OR REPLACE FUNCTION public.trigger_notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  hook_secret text;
  endpoint text := 'https://qabioapmusytvoaevwra.supabase.co/functions/v1/notify-new-review';
BEGIN
  SELECT ds.decrypted_secret INTO hook_secret
  FROM vault.decrypted_secrets ds
  WHERE ds.name = 'telegram_webhook_secret'
  LIMIT 1;

  IF hook_secret IS NULL OR length(hook_secret) < 8 THEN
    RAISE WARNING 'telegram_webhook_secret missing; skip notify';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := endpoint,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-MatchPoint-Hook-Secret', hook_secret
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW)
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_notify_telegram ON public.reviews;
CREATE TRIGGER reviews_notify_telegram
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_new_review();

REVOKE ALL ON FUNCTION public.trigger_notify_new_review() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_notify_new_review() TO postgres, service_role;
