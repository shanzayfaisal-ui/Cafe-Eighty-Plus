-- Add size and stock columns to menu_items for coffee bean inventory
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- Create index for stock queries
CREATE INDEX IF NOT EXISTS idx_menu_items_stock ON public.menu_items(stock);
