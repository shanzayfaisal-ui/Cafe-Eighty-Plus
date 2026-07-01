-- Fix contact_messages for the current admin panel flow

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_replied BOOLEAN NOT NULL DEFAULT false;

-- Ensure realtime updates are available for the admin inbox and badges
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

-- Refresh RLS so the current admin panel (using the public anon client) can read/update/delete messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can delete contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING (true);
