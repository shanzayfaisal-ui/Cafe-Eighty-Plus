-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders
CREATE POLICY "Anyone can place orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read orders (for admin purposes)
CREATE POLICY "Authenticated users can read orders"
  ON public.orders
  FOR SELECT
  USING (auth.role() = 'authenticated');