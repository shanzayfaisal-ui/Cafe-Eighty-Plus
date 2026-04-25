-- Add stock column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 999;

-- Create index on stock for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_items_stock ON public.menu_items(stock);

-- Add comment to explain the column
COMMENT ON COLUMN public.menu_items.stock IS 'Inventory stock quantity for the menu item. 0 = Out of Stock, NULL/999 = Unlimited (default)';
