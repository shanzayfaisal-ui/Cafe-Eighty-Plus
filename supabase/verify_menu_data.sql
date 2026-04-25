-- ===========================================
-- MENU DATA VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to check your data
-- ===========================================

-- View all menu categories
SELECT * FROM public.menu_categories ORDER BY display_order;

-- View all menu items with category names
SELECT
  mi.name as item_name,
  mi.description,
  mi.price,
  mi.price_num,
  mi.image_key,
  mi.display_order as item_order,
  mc.name as category_name,
  mc.display_order as category_order
FROM public.menu_items mi
JOIN public.menu_categories mc ON mi.category_id = mc.id
ORDER BY mc.display_order, mi.display_order;

-- Count items per category
SELECT
  mc.name as category,
  COUNT(mi.id) as item_count
FROM public.menu_categories mc
LEFT JOIN public.menu_items mi ON mc.id = mi.category_id
GROUP BY mc.id, mc.name
ORDER BY mc.display_order;

-- View items by specific category (example: Hot Coffee)
SELECT name, description, price, image_key
FROM public.menu_items
WHERE category_id = (SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee')
ORDER BY display_order;

-- Get all cartable items (items that can be added to cart)
SELECT
  mi.name,
  mi.price,
  mc.name as category
FROM public.menu_items mi
JOIN public.menu_categories mc ON mi.category_id = mc.id
WHERE mc.cartable = true
ORDER BY mc.display_order, mi.display_order;