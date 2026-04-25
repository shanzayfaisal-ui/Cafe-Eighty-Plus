-- =====================================================
-- Cafe Eighty Plus - Schema bootstrap for the new Supabase project
-- Target project: mxmgbvqtgvxgkbvcymlz
-- Run this first in the new project's SQL editor.
-- Then run: supabase/data/current_public_export.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cartable BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Menu categories are publicly readable" ON public.menu_categories;
CREATE POLICY "Menu categories are publicly readable"
  ON public.menu_categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  price_num INT NOT NULL DEFAULT 0,
  image_key TEXT NOT NULL DEFAULT 'espresso',
  image_url TEXT,
  image_path TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Menu items are publicly readable" ON public.menu_items;
CREATE POLICY "Menu items are publicly readable"
  ON public.menu_items FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Approved feedback is publicly readable" ON public.feedback;
CREATE POLICY "Approved feedback is publicly readable"
  ON public.feedback FOR SELECT USING (approved = true);
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  alt TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_key TEXT NOT NULL DEFAULT 'gallery-1',
  span TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gallery is publicly readable" ON public.gallery;
CREATE POLICY "Gallery is publicly readable"
  ON public.gallery FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.best_sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT 'espresso',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.best_sellers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Best sellers are publicly readable" ON public.best_sellers;
CREATE POLICY "Best sellers are publicly readable"
  ON public.best_sellers FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.coffee_guide (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ratio TEXT NOT NULL,
  milk TEXT NOT NULL,
  strength TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT 'espresso',
  layers JSONB NOT NULL DEFAULT '[]',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coffee_guide ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coffee guide is publicly readable" ON public.coffee_guide;
CREATE POLICY "Coffee guide is publicly readable"
  ON public.coffee_guide FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;
CREATE POLICY "Anyone can place orders"
  ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can read orders" ON public.orders;
CREATE POLICY "Authenticated users can read orders"
  ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
       OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Admins can manage admin_users"
  ON public.admin_users FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('Gallery', 'Gallery', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public app images are publicly readable" ON storage.objects;
CREATE POLICY "Public app images are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'Gallery'));

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Create the initial real admin auth user in Supabase Authentication first,
-- then authorize it using:
-- INSERT INTO public.admin_users (id, email)
-- SELECT id, email FROM auth.users WHERE email = 'admin@yahoo.com'
-- ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
