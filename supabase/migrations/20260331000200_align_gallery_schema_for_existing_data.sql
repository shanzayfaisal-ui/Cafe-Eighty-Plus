-- Align gallery schema with the existing live data export.
-- The previous Supabase project stores gallery rows with `title` and `image_url`,
-- while the frontend also supports local fallback rendering via `image_key`.

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS alt TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_key TEXT DEFAULT 'gallery-1',
  ADD COLUMN IF NOT EXISTS span TEXT DEFAULT '';

ALTER TABLE public.gallery
  ALTER COLUMN alt SET DEFAULT '',
  ALTER COLUMN image_key SET DEFAULT 'gallery-1',
  ALTER COLUMN span SET DEFAULT '';

UPDATE public.gallery
SET alt = COALESCE(NULLIF(alt, ''), title, 'Gallery image')
WHERE alt IS NULL OR alt = '';
