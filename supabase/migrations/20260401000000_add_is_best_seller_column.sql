-- Add is_best_seller column to menu_items table
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT false;

-- Create an index for faster filtering on is_best_seller
CREATE INDEX IF NOT EXISTS idx_menu_items_is_best_seller 
  ON public.menu_items(is_best_seller) 
  WHERE is_best_seller = true;
