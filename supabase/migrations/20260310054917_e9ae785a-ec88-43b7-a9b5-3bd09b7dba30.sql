
-- Create coffee_guide table
CREATE TABLE public.coffee_guide (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ratio TEXT NOT NULL,
  milk TEXT NOT NULL,
  strength TEXT NOT NULL,
  image_key TEXT NOT NULL DEFAULT 'espresso',
  layers JSONB NOT NULL DEFAULT '[]',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coffee_guide ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Coffee guide is publicly readable"
  ON public.coffee_guide
  FOR SELECT
  USING (true);
